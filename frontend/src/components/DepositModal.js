"use client";

import React, { useState } from "react";
import { ethers } from "ethers";

const VAULT_ADDR = "0x7E2130deE7c8716b6188255c4800486eD708862E";
const USDT_ADDR = "0xC4752a9FB06Dc0432831Befca38E071B07cE7BeB";
const REGISTRY_ADDR = "0x7AE9a2BdDa9b827483be932a6BE1372867B460c7";

const VAULT_ABI = ["function deposit(uint256 amount)"];
const USDT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount)",
  "function mint(address to, uint256 amount)"
];
const REGISTRY_ABI = ["function hasValidSBT(address) view returns (bool)"];
const HSK_TESTNET_RPC = "https://testnet.hsk.xyz";

export default function DepositModal({ isOpen, onClose, account, provider, isVerified, onSuccess, addLog, ensureHashKeyNetwork }) {
  const [amountInput, setAmountInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fauceting, setFauceting] = useState(false);

  if (!isOpen) return null;

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
    if (!provider || !account) return;
    setFauceting(true);
    addLog("mockUSDT", "INFO", "Requesting testnet faucet mint (+1,000 USDT)...");
    try {
      const switched = await ensureHashKeyNetwork();
      if (!switched) return;
      const signer = await provider.getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDR, USDT_ABI, signer);
      const tx = await usdtContract.mint(account, ethers.parseUnits("1000", 6));
      await tx.wait();
      addLog("mockUSDT", "INFO", "Testnet USDT minted successfully into reserve.");
      await handleSetMax();
    } catch (err) {
      addLog("mockUSDT", "WARNING", `Faucet failed: ${err.shortMessage || err.message}`);
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
    addLog("Orchestrator_Agent", "INFO", `Validating dynamic deposit submission of ${amountInput} USDT...`);

    try {
      // 1. Regulatory Identity Pre-Check
      const rpc = new ethers.JsonRpcProvider(HSK_TESTNET_RPC);
      const readReg = new ethers.Contract(REGISTRY_ADDR, REGISTRY_ABI, rpc);
      const onChainValid = await readReg.hasValidSBT(account);

      if (!onChainValid && !isVerified) {
        addLog("SBTRegistry", "WARNING", "Transaction Blocked - Missing Regulatory Identity SBT");
        alert("Transaction Blocked: Your account lacks a valid KYC Regulatory Identity SBT on HashKey Testnet.");
        setSubmitting(false);
        return;
      }

      // 2. Balance Validation
      const readUsdt = new ethers.Contract(USDT_ADDR, USDT_ABI, rpc);
      const bal = await readUsdt.balanceOf(account);
      const parsedAmount = ethers.parseUnits(amountInput, 6); // 6 decimals (amount * 10^6)

      if (parsedAmount > bal) {
        addLog("CompliantYieldVault", "WARNING", "Deposit aborted: Amount exceeds current custody balance.");
        alert("Validation Error: Amount exceeds current custody balance. Please use Faucet.");
        setSubmitting(false);
        return;
      }

      // 3. Network Alignment
      const switched = await ensureHashKeyNetwork();
      if (!switched) {
        setSubmitting(false);
        return;
      }

      const signer = await provider.getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDR, USDT_ABI, signer);
      const vaultContract = new ethers.Contract(VAULT_ADDR, VAULT_ABI, signer);

      // 4. Token Allowance
      addLog("mockUSDT", "INFO", `Authorizing USDT token spending allowance (${amountInput} USDT)...`);
      const approveTx = await usdtContract.approve(VAULT_ADDR, parsedAmount);
      await approveTx.wait();

      // 5. Vault Deposit with Error Capture
      addLog("CompliantYieldVault", "INFO", `Broadcasting deposit(${parsedAmount.toString()}) to HashKey Chain...`);
      const depTx = await vaultContract.deposit(parsedAmount);
      await depTx.wait();

      addLog("CompliantYieldVault", "INFO", `Successfully deposited ${amountInput} USDT into institutional reserve.`);
      await onSuccess();
      onClose();
    } catch (err) {
      console.error("Deposit submission error:", err);
      const reason = err.shortMessage || err.reason || err.message || "Unknown execution revert";
      if (reason.toLowerCase().includes("allowance")) {
        addLog("CompliantYieldVault", "WARNING", "[Error]: Deposit Failed - Insufficient Allowance");
      } else if (reason.toLowerCase().includes("sbt") || reason.toLowerCase().includes("verified") || reason.toLowerCase().includes("gate")) {
        addLog("CompliantYieldVault", "WARNING", "[Error]: Deposit Failed - Compliance Gate Reversion");
      } else {
        addLog("CompliantYieldVault", "WARNING", `[Error]: Deposit Failed - ${reason}`);
      }
      alert(`Deposit Failed: ${reason}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl p-8 max-w-md w-full relative">
        <button
          onClick={onClose}
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
                onChange={(e) => setAmountInput(e.target.value)}
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

          <div className="pt-4">
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
