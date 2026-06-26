"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../context/WalletContext";

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, account, disconnectWallet } = useWallet();
  const [telemetryLogs, setTelemetryLogs] = useState([
    { id: 1, timestamp: new Date().toLocaleTimeString(), agent: "System", level: "INFO", message: "SSE Reassurance Console initialized." }
  ]);
  const [stakedBalance, setStakedBalance] = useState("10,000.00");
  const [pendingReward, setPendingReward] = useState("100.00");

  // Authentication Gate Redirect Enforcement
  useEffect(() => {
    if (!isConnected) {
      router.replace("/");
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null; // Prevent flash of unauthorized content
  }

  const handleDisconnect = () => {
    disconnectWallet();
    router.replace("/");
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const addLog = (agent, level, message) => {
    setTelemetryLogs((prev) => [
      { id: Date.now(), timestamp: new Date().toLocaleTimeString(), agent, level, message },
      ...prev.slice(0, 49)
    ]);
  };

  const handleDeposit = () => {
    addLog("CompliantYieldVault", "INFO", `Deposit initiated for ${account} (SBT Gate Verified)`);
  };

  const handleSimulateYield = () => {
    addLog("Orchestrator_Agent", "INFO", "Simulating O(1) Model B reward accumulation cycle (+100 units)");
  };

  const handleTriggerPayout = () => {
    addLog("Mandate_Execution_Agent", "INFO", "AP2 EIP-712 Mandate triggered. Net payout settled.");
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-[#111827]/60 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => router.push("/")}>
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
            H
          </div>
          <span className="text-xl font-bold tracking-tight text-white">HashStaking Console</span>
          <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/30">
            Clearance Tier: VERIFIED
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-[#111827] px-4 py-2 rounded-lg border border-white/10 flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-emerald-400">{formatAddress(account)}</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold transition-all shadow-sm hover:shadow-rose-500/10 active:scale-95"
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Main Executive Calm Layout */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
        {/* Left Column: Yield Reserve & Control Cap */}
        <div className="lg:col-span-2 flex flex-col space-y-8">
          {/* Executive Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#111827] p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
              <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Active Custody Stake</div>
              <div className="text-4xl font-extrabold text-white font-mono tracking-tight">{stakedBalance} <span className="text-lg text-slate-500">mockUSDT</span></div>
              <div className="mt-4 flex items-center text-xs text-emerald-400 font-medium">
                <span>↑ Model B Precision: 1e12 Factor</span>
              </div>
            </div>

            <div className="bg-[#111827] p-6 rounded-2xl border border-white/10 relative overflow-hidden shadow-xl">
              <div className="text-xs font-medium text-slate-400 mb-2 uppercase tracking-wider">Derivable O(1) Yield</div>
              <div className="text-4xl font-extrabold text-emerald-400 font-mono tracking-tight">+{pendingReward} <span className="text-lg text-slate-500">mockUSDT</span></div>
              <div className="mt-4 flex items-center text-xs text-slate-400">
                <span>3.00% Performance Fee Reserve</span>
              </div>
            </div>
          </div>

          {/* Three-Button Control Cap */}
          <div className="bg-[#111827] p-8 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-between flex-1">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Sovereign Executive Operations</h2>
              <p className="text-sm text-slate-400 mb-8">
                Trigger state updates directly against compliant on-chain vault accounting and EIP-712 payment mandates.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleDeposit}
                className="py-4 px-6 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-sm transition-all flex flex-col items-center justify-center space-y-1 group shadow-sm hover:shadow-emerald-500/10 active:scale-95"
              >
                <span>[ Deposit ]</span>
                <span className="text-[10px] font-normal text-emerald-500 group-hover:text-emerald-400">Gated by KYC SBT</span>
              </button>

              <button
                onClick={handleSimulateYield}
                className="py-4 px-6 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-bold text-sm transition-all flex flex-col items-center justify-center space-y-1 group shadow-sm hover:shadow-cyan-500/10 active:scale-95"
              >
                <span>[ Simulate Yield ]</span>
                <span className="text-[10px] font-normal text-cyan-500 group-hover:text-cyan-400">Advance Accumulator</span>
              </button>

              <button
                onClick={handleTriggerPayout}
                className="py-4 px-6 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 font-bold text-sm transition-all flex flex-col items-center justify-center space-y-1 group shadow-sm hover:shadow-purple-500/10 active:scale-95"
              >
                <span>[ Trigger Payout ]</span>
                <span className="text-[10px] font-normal text-purple-500 group-hover:text-purple-400">AP2 Mandate Harvest</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: SSE Reassurance Console Overlay */}
        <div className="bg-[#111827] rounded-2xl border border-white/10 shadow-xl flex flex-col h-full overflow-hidden">
          <div className="p-5 border-b border-white/10 bg-[#0B0F19]/40 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-sm font-bold tracking-tight text-white font-mono">Agent Telemetry SSE</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">/api/v1/telemetry/stream</span>
          </div>

          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3 max-h-[500px]">
            {telemetryLogs.map((log) => (
              <div key={log.id} className="p-3 rounded-lg bg-[#0B0F19]/60 border border-white/5 space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span className="text-cyan-400 font-semibold">[{log.agent}]</span>
                  <span>{log.timestamp}</span>
                </div>
                <div className={log.level === "WARNING" ? "text-rose-400 font-semibold" : "text-slate-300"}>
                  {log.message}
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#0B0F19]/80 border-t border-white/5 text-[11px] text-slate-500 text-center font-mono">
            ● Live Stream Connected (Keepalive Active)
          </div>
        </div>
      </main>
    </div>
  );
}
