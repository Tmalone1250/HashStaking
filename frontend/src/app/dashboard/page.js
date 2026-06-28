"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ethers } from "ethers";
import { useWallet } from "../../context/WalletContext";
import DepositModal from "../../components/DepositModal";

// Live HashKey Mainnet Production Addresses (Chain ID 177)
const VAULT_ADDR = process.env.NEXT_PUBLIC_COMPLIANT_YIELD_VAULT_ADDRESS || "0x82223DaFAD9233c52718435DA4690DE75aA7EA84";
const USDT_ADDR = process.env.NEXT_PUBLIC_MOCK_USDT_ADDRESS || "0xF0e9f136cb74045020671836ee8dC894E2671b59";
const REGISTRY_ADDR = process.env.NEXT_PUBLIC_SBT_REGISTRY_ADDRESS || "0x76a545Ad068173e5B1C111A57d6576926EDa1C77";

const VAULT_ABI = [
  "function userInfo(address) view returns (uint256 stakedAmount, uint256 rewardDebt, uint256 cumulativePaidFees)",
  "function totalStaked() view returns (uint256)",
  "function accumulatedTokenPerShare() view returns (uint256)",
  "function pendingYield(address) view returns (uint256)",
  "function deposit(uint256 amount)",
  "function withdraw(uint256 amount)",
  "function injectYieldRewards(uint256 amount)",
  "function emergencyWithdraw()",
  "function isAssetWindDownActive() view returns (bool)",
  "function paused() view returns (bool)",
  "function toggleAssetWindDown(bool _status)",
  "function pauseVault()",
  "function unpauseVault()",
  "function skimDust(address _token, uint256 _amount)"
];

const USDT_ABI = [
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address, address) view returns (uint256)",
  "function approve(address spender, uint256 amount)",
  "function mint(address to, uint256 amount)"
];

const REGISTRY_ABI = [
  "function hasValidSBT(address) view returns (bool)",
  "function getVerificationTier(address) view returns (uint256)"
];

const HSK_TESTNET_RPC = process.env.NEXT_PUBLIC_HASHKEY_RPC_URL || "https://mainnet.hsk.xyz";

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, account, isVerified, checkingIdentity, provider, disconnectWallet } = useWallet();

  // Real On-Chain State (Zero Mock Data)
  const [stakedBalance, setStakedBalance] = useState("0.00");
  const [pendingReward, setPendingReward] = useState("0.00");
  const [walletUSDT, setWalletUSDT] = useState("0.00");
  const [clearanceTier, setClearanceTier] = useState("UNVERIFIED");
  const [isLoading, setIsLoading] = useState(true);
  const [txPending, setTxPending] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);

  const [telemetryLogs, setTelemetryLogs] = useState([
    { id: 1, timestamp: new Date().toLocaleTimeString(), agent: "System", level: "INFO", message: "Connecting to HashKey Testnet RPC (Chain ID 133)..." }
  ]);

  const addLog = useCallback((agent, level, message) => {
    setTelemetryLogs((prev) => [
      { id: Date.now() + Math.random(), timestamp: new Date().toLocaleTimeString(), agent, level, message },
      ...prev.slice(0, 49)
    ]);
  }, []);

  // Fetch Live On-Chain Data reliably via direct JsonRpcProvider
  const fetchOnChainData = useCallback(async () => {
    if (!account) return;
    try {
      const rpc = new ethers.JsonRpcProvider(HSK_TESTNET_RPC);
      const vaultContract = new ethers.Contract(VAULT_ADDR, VAULT_ABI, rpc);
      const usdtContract = new ethers.Contract(USDT_ADDR, USDT_ABI, rpc);
      const regContract = new ethers.Contract(REGISTRY_ADDR, REGISTRY_ABI, rpc);

      const [uInfo, pYield, bal, sbtValid, tier] = await Promise.all([
        vaultContract.userInfo(account),
        vaultContract.pendingYield(account),
        usdtContract.balanceOf(account),
        regContract.hasValidSBT(account),
        regContract.getVerificationTier(account)
      ]);

      const rawStaked = uInfo[0] ?? uInfo.stakedAmount ?? 0n;
      const fmtStaked = Number(ethers.formatUnits(rawStaked, 6)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmtYield = Number(ethers.formatUnits(pYield, 6)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
      const fmtBal = Number(ethers.formatUnits(bal, 6)).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

      setStakedBalance(fmtStaked);
      setPendingReward(fmtYield);
      setWalletUSDT(fmtBal);
      setClearanceTier(sbtValid || isVerified ? `TIER ${tier > 0n ? tier.toString() : "1"} VERIFIED` : "UNVERIFIED");
      setIsLoading(false);
    } catch (err) {
      console.error("Live RPC sync error:", err);
      setIsLoading(false);
    }
  }, [account, isVerified]);

  // Authentication Gate Redirect Enforcement
  useEffect(() => {
    if (!isConnected) {
      router.replace("/");
    } else {
      fetchOnChainData();
      addLog("Orchestrator_Agent", "INFO", `Custody account synchronized with HashKey Testnet reserve.`);
    }
  }, [isConnected, router, fetchOnChainData, addLog]);

  // Connect to live SSE telemetry stream if backend active
  useEffect(() => {
    if (typeof window === "undefined") return;
    const evtSource = new EventSource("http://localhost:8000/api/v1/telemetry/stream");
    evtSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        addLog(data.agent || "AP2_Engine", data.level || "INFO", data.message || event.data);
      } catch {
        addLog("AP2_Engine", "INFO", event.data);
      }
    };
    evtSource.onerror = () => {
      // Backend SSE disconnected (using direct RPC polling)
    };
    return () => evtSource.close();
  }, [addLog]);

  if (!isConnected) {
    return null; // Prevent unauthorized content flash
  }

  const handleDisconnect = () => {
    disconnectWallet();
    router.replace("/");
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Helper to ensure wallet is on HashKey Chain Testnet (Chain ID 133 / 0x85)
  const ensureHashKeyNetwork = async () => {
    if (!window.ethereum) return false;
    try {
      const chainId = await window.ethereum.request({ method: "eth_chainId" });
      if (chainId !== "0x85" && chainId !== 133 && chainId !== "133") {
        addLog("Network_Agent", "INFO", "Prompting wallet switch to HashKey Chain Testnet (Chain ID 133)...");
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: "0x85" }],
          });
        } catch (switchError) {
          if (switchError.code === 4902 || switchError.message?.includes("4902") || switchError.message?.includes("Unrecognized")) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: "0x85",
                  chainName: "HashKey Chain Testnet",
                  nativeCurrency: { name: "HashKey Eco Points", symbol: "HSK", decimals: 18 },
                  rpcUrls: [HSK_TESTNET_RPC],
                  blockExplorerUrls: [HSK_TESTNET_RPC],
                },
              ],
            });
          } else {
            throw switchError;
          }
        }
      }
      return true;
    } catch (err) {
      console.error("Network switch rejected or failed:", err);
      alert("Please switch your Web3 Wallet network to HashKey Chain Testnet (Chain ID 133) to interact with contracts.");
      return false;
    }
  };

  const handleInjectYield = async () => {
    if (!provider || !account) return;
    const rawAmt = prompt("Enter USDT yield amount in smallest units (default 5000000 for 5 USDT):", "5000000");
    if (!rawAmt || isNaN(Number(rawAmt))) return;

    const amount = BigInt(rawAmt);
    if (amount <= 0n) return;

    setTxPending(true);
    addLog("Orchestrator_Agent", "INFO", `Authorizing institutional yield injection of ${ethers.formatUnits(amount, 6)} USDT...`);

    try {
      const networkSwitched = await ensureHashKeyNetwork();
      if (!networkSwitched) {
        setTxPending(false);
        return;
      }

      const signer = await provider.getSigner();
      const usdtContract = new ethers.Contract(USDT_ADDR, USDT_ABI, signer);
      const vaultContract = new ethers.Contract(VAULT_ADDR, VAULT_ABI, signer);

      const rpc = new ethers.JsonRpcProvider(HSK_TESTNET_RPC);
      const readUsdt = new ethers.Contract(USDT_ADDR, USDT_ABI, rpc);
      const bal = await readUsdt.balanceOf(account);
      if (bal < amount) {
        addLog("mockUSDT", "INFO", "Insufficient USDT balance. Minting testnet faucet tokens (+1,000 USDT)...");
        const mintTx = await usdtContract.mint(account, ethers.parseUnits("1000", 6));
        await mintTx.wait();
      }

      addLog("mockUSDT", "INFO", "Authorizing custody vault transfer allowance...");
      const approveTx = await usdtContract.approve(VAULT_ADDR, amount);
      await approveTx.wait();

      addLog("CompliantYieldVault", "INFO", "Broadcasting injectYieldRewards transaction to HashKey Chain...");
      const tx = await vaultContract.injectYieldRewards(amount);
      await tx.wait();

      addLog("CompliantYieldVault", "INFO", `Successfully injected ${ethers.formatUnits(amount, 6)} USDT yield into institutional reserve.`);
      await fetchOnChainData();
    } catch (err) {
      console.error("Injection error:", err);
      addLog("CompliantYieldVault", "WARNING", "[Error]: Injection Failed - Unauthorized Admin Role");
      alert("[Error]: Injection Failed - Unauthorized Admin Role");
    } finally {
      setTxPending(false);
    }
  };

  const handleTriggerPayout = async () => {
    if (!provider || !account) return;
    setTxPending(true);
    addLog("Mandate_Execution_Agent", "INFO", "Authorizing EIP-712 compliant payout mandate...");
    try {
      const rpc = new ethers.JsonRpcProvider(HSK_TESTNET_RPC);
      const readVault = new ethers.Contract(VAULT_ADDR, VAULT_ABI, rpc);
      const uInfo = await readVault.userInfo(account);
      const staked = uInfo[0] ?? uInfo.stakedAmount ?? 0n;

      if (staked === 0n) {
        addLog("CompliantYieldVault", "WARNING", "Settlement aborted: Zero active custody stake.");
        alert("Settlement Aborted: Zero active custody stake to withdraw.");
        setTxPending(false);
        return;
      }

      const networkSwitched = await ensureHashKeyNetwork();
      if (!networkSwitched) {
        setTxPending(false);
        return;
      }

      const signer = await provider.getSigner();
      const vaultContract = new ethers.Contract(VAULT_ADDR, VAULT_ABI, signer);

      addLog("CompliantYieldVault", "INFO", "Broadcasting withdrawal harvest transaction...");
      const tx = await vaultContract.withdraw(staked);
      await tx.wait();

      addLog("CompliantYieldVault", "INFO", "Institutional payout settled directly to custody account (net of 3% fee reserve).");
      await fetchOnChainData();
    } catch (err) {
      console.error(err);
      addLog("Mandate_Execution_Agent", "WARNING", `Settlement failed: ${err.shortMessage || err.message}`);
    } finally {
      setTxPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-600/20">
            H
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">HashStaking Console</span>
          
          <div className="flex items-center space-x-2 ml-4">
            {checkingIdentity ? (
              <span className="text-xs px-2.5 py-1 rounded-md font-mono font-semibold bg-slate-100 text-slate-500 border border-slate-200 animate-pulse">
                ⏳ Syncing SBT On-Chain...
              </span>
            ) : isVerified || clearanceTier.includes("VERIFIED") ? (
              <span className="text-xs px-2.5 py-1 rounded-md font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                🟢 Verified Institution ({formatAddress(account)})
              </span>
            ) : (
              <button
                onClick={() => router.push("/")}
                className="text-xs px-2.5 py-1 rounded-md font-mono font-semibold bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs hover:bg-amber-100 transition-colors animate-pulse cursor-pointer"
              >
                ⚠️ Pending Verification • Complete Onboarding
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 shadow-2xs flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-slate-500 mr-1">Custody Balance:</span>
            <span className="text-xs font-mono text-emerald-700 font-bold">{walletUSDT} USDT</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-all shadow-2xs active:scale-95 cursor-pointer"
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Main Enterprise Light Layout */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
        {/* Left Column: Live On-Chain Reserve & Control Cap */}
        <div className="lg:col-span-2 flex flex-col space-y-8">
          {/* Executive Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 relative overflow-hidden shadow-md shadow-slate-200/50">
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center justify-between">
                <span>Active Custody Stake</span>
                {isLoading && <span className="text-[10px] text-emerald-600 animate-pulse font-mono">SYNCING RPC...</span>}
              </div>
              <div className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">
                {isLoading ? "..." : stakedBalance} <span className="text-lg text-slate-500 font-sans font-semibold">USDT</span>
              </div>
              <div className="mt-4 flex items-center text-xs text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                <span>Live Segregated On-Chain Reserve</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 relative overflow-hidden shadow-md shadow-slate-200/50">
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider flex items-center justify-between">
                <span>Net Accrued Yield</span>
                {isLoading && <span className="text-[10px] text-emerald-600 animate-pulse font-mono">DERIVING O(1)...</span>}
              </div>
              <div className="text-4xl font-extrabold text-emerald-600 font-mono tracking-tight">
                +{isLoading ? "..." : pendingReward} <span className="text-lg text-slate-500 font-sans font-semibold">USDT</span>
              </div>
              <div className="mt-4 flex items-center text-xs text-slate-500 font-medium">
                <span>Automated Real-Time Settlement</span>
              </div>
            </div>
          </div>

          {/* Treasury Control Cap */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 flex flex-col justify-between flex-1">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Institutional Treasury Operations</h2>
              <p className="text-sm text-slate-600 mb-8 leading-relaxed">
                Execute instant corporate deposits, monitor automated yield distributions, and authorize regulatory-compliant payouts directly against HashKey Testnet contracts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => setIsDepositModalOpen(true)}
                disabled={txPending}
                className={`py-4 px-6 rounded-xl border font-bold text-sm transition-all flex flex-col items-center justify-center space-y-1 group shadow-2xs ${txPending ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-900 active:scale-95 cursor-pointer"}`}
              >
                <span>{txPending ? "[ Processing... ]" : "[ Deposit ]"}</span>
                <span className="text-[10px] font-semibold text-emerald-600 group-hover:text-emerald-700">Flexible Capital Allocation</span>
              </button>

              <button
                onClick={handleInjectYield}
                disabled={txPending}
                className={`py-4 px-6 rounded-xl border font-bold text-sm transition-all flex flex-col items-center justify-center space-y-1 group shadow-2xs ${txPending ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-sky-50 hover:bg-sky-100/80 border-sky-200 text-sky-900 active:scale-95 cursor-pointer"}`}
              >
                <span>{txPending ? "[ Injecting... ]" : "[ Accrue Yield ]"}</span>
                <span className="text-[10px] font-semibold text-sky-600 group-hover:text-sky-700">Contract Yield Injection</span>
              </button>

              <button
                onClick={handleTriggerPayout}
                disabled={txPending}
                className={`py-4 px-6 rounded-xl border font-bold text-sm transition-all flex flex-col items-center justify-center space-y-1 group shadow-2xs ${txPending ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed" : "bg-purple-50 hover:bg-purple-100/80 border-purple-200 text-purple-900 active:scale-95 cursor-pointer"}`}
              >
                <span>{txPending ? "[ Settling... ]" : "[ Trigger Payout ]"}</span>
                <span className="text-[10px] font-semibold text-purple-600 group-hover:text-purple-700">Compliant Settlement</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Activity & Audit Stream */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-md shadow-slate-200/50 flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-bold tracking-tight text-slate-900 font-mono">Live Activity & Audit Stream</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">Chain ID: 133</span>
          </div>

          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3 max-h-[500px] bg-slate-50/30">
            {telemetryLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span className="text-sky-700 font-bold">[{log.agent}]</span>
                  <span>{log.timestamp}</span>
                </div>
                <div className={log.level === "WARNING" ? "text-rose-600 font-bold" : "text-slate-700 leading-relaxed"}>
                  {log.message}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-500 text-center font-mono font-medium">
            ● Connected to Live HashKey Testnet Contracts
          </div>
        </div>
      </main>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => setIsDepositModalOpen(false)}
        account={account}
        provider={provider}
        isVerified={isVerified}
        onSuccess={fetchOnChainData}
        addLog={addLog}
        ensureHashKeyNetwork={ensureHashKeyNetwork}
      />
    </div>
  );
}
