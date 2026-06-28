"use client";

import React, { useState } from "react";
import { ethers } from "ethers";

const VAULT_ADDR = process.env.NEXT_PUBLIC_COMPLIANT_YIELD_VAULT_ADDRESS || "0x82223DaFAD9233c52718435DA4690DE75aA7EA84";
const USDT_ADDR = process.env.NEXT_PUBLIC_MOCK_USDT_ADDRESS || "0xF0e9f136cb74045020671836ee8dC894E2671b59";
const REGISTRY_ADDR = process.env.NEXT_PUBLIC_SBT_REGISTRY_ADDRESS || "0x76a545Ad068173e5B1C111A57d6576926EDa1C77";

const VAULT_ABI = ["function deposit(uint256 amount)"];
const USDT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount)",
  "function mint(address to, uint256 amount)"
];
const REGISTRY_ABI = ["function hasValidSBT(address) view returns (bool)"];
const HSK_TESTNET_RPC = process.env.NEXT_PUBLIC_HASHKEY_RPC_URL || "https://mainnet.hsk.xyz";

export default function DepositModal({ isOpen, onClose, account, provider, isVerified, onSuccess, addLog, ensureHashKeyNetwork }) {
  const [amountInput, setAmountInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fauceting, setFauceting] = useState(false);
  const [depositStep, setDepositStep] = useState(0); // 0: idle, 1: pre-check, 2: allowance, 3: deposit, 4: success, -1: error
  const [statusMsg, setStatusMsg] = useState("");

  if (!isOpen) return null;

  const handleCloseModal = () => {
    if (submitting) return;
    setDepositStep(0);
    setStatusMsg("");
    onClose();
  };

  // Query live balance and set to Max
  const handleSetMax = async () => {
    if (!account) return;
    try {
      const rpc = new ethers.JsonRpcProvider(HSK_TESTNET_RPC);
      const readUsdt = new ethers.Contract(USDT_ADDR, USDT_ABI, rpc);
      const bal = await readUsdt.balanceOf(account);
      const fmt = ethers.formatUnits(bal, 6);
      setAmountInput(fmt);
    } catch (err) {
      console.error("Max balance check error:", err);
    }
  };

  const handleFaucetMint = async () => {
    if (!account) return;
    setFauceting(true);
    addLog("Faucet_Dispenser_Agent", "INFO", "Requesting backend faucet claim (+1,000 USDT)...");
    try {
      const res = await fetch("http://localhost:8000/api/v1/faucet/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet_address: account })
      });
      if (!res.ok) {
        throw new Error("Backend faucet dispenser rejected request");
      }
      addLog("mockUSDT", "INFO", "Testnet USDT minted successfully via backend dispenser.");
      await handleSetMax();
    } catch (err) {
      console.warn("Backend faucet failed, attempting fallback direct browser mint:", err);
      try {
        const switched = await ensureHashKeyNetwork();
        if (switched && provider) {
          const signer = await provider.getSigner();
          const usdtContract = new ethers.Contract(USDT_ADDR, USDT_ABI, signer);
          const tx = await usdtContract.mint(account, ethers.parseUnits("1000", 6));
          await tx.wait();
          addLog("mockUSDT", "INFO", "Direct contract mint confirmed.");
          await handleSetMax();
        }
      } catch (fallbackErr) {
        addLog("mockUSDT", "WARNING", `Faucet failed: ${fallbackErr.shortMessage || fallbackErr.message}`);
        alert("Faucet failed: " + (fallbackErr.shortMessage || fallbackErr.message));
      }
    } finally {
      setFauceting(false);
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!provider || !account) return;

    const numAmt = Number(amountInput);
    if (isNaN(numAmt) || numAmt <= 0) {
      addLog("CompliantYieldVault", "WARNING", "Deposit aborted: Amount must be greater than 0.");
      alert("Validation Error: Deposit amount must be greater than 0.");
      return;
    }

    setSubmitting(true);
    setDepositStep(1);
    setStatusMsg("Step 1/3: Validating regulatory KYC & balance...");
    addLog("Orchestrator_Agent", "INFO", `Validating dynamic deposit submission of ${amountInput} USDT...`);

    try {
      // 1. Regulatory Identity Pre-Check
      const rpc = new ethers.JsonRpcProvider(HSK_TESTNET_RPC);
      const readReg = new ethers.Contract(REGISTRY_ADDR, REGISTRY_ABI, rpc);
      const onChainValid = await readReg.hasValidSBT(account);

      if (!onChainValid && !isVerified) {
        const errMsg = "Transaction Blocked: Missing Regulatory Identity SBT";
        addLog("SBTRegistry", "WARNING", errMsg);
        setDepositStep(-1);
        setStatusMsg(errMsg);
        setSubmitting(false);
        return;
      }

      // 2. Balance Validation
      const readUsdt = new ethers.Contract(USDT_ADDR, USDT_ABI, rpc);
      const bal = await readUsdt.balanceOf(account);
      const parsedAmount = ethers.parseUnits(amountInput, 6); // 6 decimals (amount * 10^6)

      if (parsedAmount > bal) {
        const errMsg = "Validation Error: Amount exceeds custody balance";
        addLog("CompliantYieldVault", "WARNING", errMsg);
        setDepositStep(-1);
        setStatusMsg(errMsg);
        setSubmitting(false);
        return;
      }

      // 3. Network Alignment
      const switched = await ensureHashKeyNetwork();
      if (!switched) {
        setDepositStep(-1);
        setStatusMsg("Network synchronization failed or cancelled.");
        setSubmitting(false);
        return;
      }

      const signer = await provider.getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDR, USDT_ABI, signer);
      const vaultContract = new ethers.Contract(VAULT_ADDR, VAULT_ABI, signer);

      // 4. Token Allowance
      setDepositStep(2);
      setStatusMsg("Step 2/3: Authorizing token allowance...");
      addLog("mockUSDT", "INFO", `Authorizing USDT token spending allowance (${amountInput} USDT)...`);
      const approveTx = await usdtContract.approve(VAULT_ADDR, parsedAmount);
      await approveTx.wait();

      // 5. Vault Deposit with Error Capture
      setDepositStep(3);
      setStatusMsg("Step 3/3: Broadcasting deposit to vault...");
      addLog("CompliantYieldVault", "INFO", `Broadcasting deposit(${parsedAmount.toString()}) to HashKey Chain...`);
      const depTx = await vaultContract.deposit(parsedAmount);
      await depTx.wait();

      setDepositStep(4);
      setStatusMsg("Deposit Successful!");
      addLog("CompliantYieldVault", "INFO", `Successfully deposited ${amountInput} USDT into institutional reserve.`);
      await onSuccess();
      
      setTimeout(() => {
        onClose();
        setDepositStep(0);
        setStatusMsg("");
      }, 1800);
    } catch (err) {
      console.error("Deposit submission error:", err);
      const reason = err.shortMessage || err.reason || err.message || "Unknown execution revert";
      let displayErr = reason;
      if (reason.toLowerCase().includes("allowance")) {
        displayErr = "Deposit Failed: Insufficient Allowance";
        addLog("CompliantYieldVault", "WARNING", "[Error]: Deposit Failed - Insufficient Allowance");
      } else if (reason.toLowerCase().includes("sbt") || reason.toLowerCase().includes("verified") || reason.toLowerCase().includes("gate") || reason.toLowerCase().includes("missing")) {
        displayErr = "Deposit Failed: Regulatory Compliance Gate Reverted";
        addLog("CompliantYieldVault", "WARNING", "[Error]: Deposit Failed - Compliance Gate Reversion");
      } else if (reason.toLowerCase().includes("user rejected") || reason.toLowerCase().includes("rejected")) {
        displayErr = "Deposit Cancelled: Transaction rejected by wallet";
        addLog("CompliantYieldVault", "WARNING", "[Error]: Transaction rejected by wallet");
      } else {
        displayErr = `Deposit Failed: ${reason.slice(0, 65)}`;
        addLog("CompliantYieldVault", "WARNING", `[Error]: Deposit Failed - ${reason}`);
      }
      setDepositStep(-1);
      setStatusMsg(displayErr);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 max-w-md w-full relative">
        <button
          onClick={handleCloseModal}
          disabled={submitting}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 font-bold cursor-pointer"
        >
          ✕
        </button>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Institutional Asset Allocation</h2>
        <p className="text-xs text-slate-500 mb-6">Specify dynamic USDT capital amount to transfer into segregated O(1) yield custody.</p>

        <form onSubmit={handleDepositSubmit} className="space-y-4 text-left">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold text-slate-700">Capital Allocation (USDT)</label>
              <button
                type="button"
                onClick={handleSetMax}
                className="text-[11px] font-mono font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
              >
                MAX BALANCE
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                placeholder="0.00"
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  if (depositStep === -1) {
                    setDepositStep(0);
                    setStatusMsg("");
                  }
                }}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-200 text-base font-mono font-bold focus:outline-none focus:border-emerald-500 bg-slate-50 text-slate-900"
              />
              <span className="absolute right-4 top-3.5 text-xs font-bold text-slate-400">USDT</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">Need testnet reserve liquidity?</span>
            <button
              type="button"
              onClick={handleFaucetMint}
              disabled={fauceting || submitting}
              className="text-[11px] px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 transition-colors cursor-pointer"
            >
              {fauceting ? "Minting..." : "+ Faucet 1,000 USDT"}
            </button>
          </div>

          {/* Dynamic Status Progress Bar */}
          {depositStep !== 0 && (
            <div className="pt-2 transition-all animate-fadeIn">
              <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                <span className={depositStep === -1 ? "text-rose-600 truncate max-w-[280px]" : depositStep === 4 ? "text-emerald-600" : "text-slate-700"}>
                  {statusMsg}
                </span>
                {depositStep > 0 && depositStep < 4 && (
                  <span className="text-slate-500 font-mono">{depositStep === 1 ? "33%" : depositStep === 2 ? "66%" : "90%"}</span>
                )}
                {depositStep === 4 && <span className="text-emerald-600 font-mono">100%</span>}
                {depositStep === -1 && <span className="text-rose-600 font-mono">Failed</span>}
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    depositStep === -1
                      ? "w-full bg-rose-500"
                      : depositStep === 1
                      ? "w-1/3 bg-blue-500 animate-pulse"
                      : depositStep === 2
                      ? "w-2/3 bg-amber-500 animate-pulse"
                      : depositStep === 3
                      ? "w-11/12 bg-indigo-500 animate-pulse"
                      : "w-full bg-emerald-500"
                  }`}
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting || !amountInput}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 font-bold text-white shadow-lg shadow-emerald-600/20 transition-all text-sm disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Broadcasting Allocation..." : "Confirm & Deposit Capital →"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
