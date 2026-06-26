"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../../context/WalletContext";

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, account, disconnectWallet } = useWallet();
  const [telemetryLogs, setTelemetryLogs] = useState([
    { id: 1, timestamp: new Date().toLocaleTimeString(), agent: "System", level: "INFO", message: "Institutional Custody & Compliance Engine Active." }
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

  const handleAccrueYield = () => {
    addLog("Orchestrator_Agent", "INFO", "Accruing automated institutional yield distribution (+100 USDT)");
  };

  const handleTriggerPayout = () => {
    addLog("Mandate_Execution_Agent", "INFO", "AP2 EIP-712 Mandate triggered. Net payout settled.");
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
          <span className="text-xs px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-mono font-semibold border border-emerald-200">
            Clearance Tier: VERIFIED
          </span>
        </div>

        <div className="flex items-center space-x-4">
          <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-200 shadow-2xs flex items-center space-x-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono text-emerald-700 font-bold">{formatAddress(account)}</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-4 py-2 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-semibold transition-all shadow-2xs active:scale-95"
          >
            Disconnect
          </button>
        </div>
      </header>

      {/* Main Enterprise Light Layout */}
      <main className="flex-1 p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto w-full">
        {/* Left Column: Staked Reserve & Control Cap */}
        <div className="lg:col-span-2 flex flex-col space-y-8">
          {/* Executive Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 relative overflow-hidden shadow-md shadow-slate-200/50">
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Active Custody Stake</div>
              <div className="text-4xl font-extrabold text-slate-900 font-mono tracking-tight">{stakedBalance} <span className="text-lg text-slate-500 font-sans font-semibold">USDT</span></div>
              <div className="mt-4 flex items-center text-xs text-emerald-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                <span>Fully Segregated Institutional Reserve</span>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 relative overflow-hidden shadow-md shadow-slate-200/50">
              <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">Net Accrued Yield</div>
              <div className="text-4xl font-extrabold text-emerald-600 font-mono tracking-tight">+{pendingReward} <span className="text-lg text-slate-500 font-sans font-semibold">USDT</span></div>
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
                Execute instant corporate deposits, monitor automated yield distributions, and authorize regulatory-compliant payouts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={handleDeposit}
                className="py-4 px-6 rounded-xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 text-emerald-900 font-bold text-sm transition-all flex flex-col items-center justify-center space-y-1 group shadow-2xs active:scale-95"
              >
                <span>[ Deposit ]</span>
                <span className="text-[10px] font-semibold text-emerald-600 group-hover:text-emerald-700">Verified Identity Gate</span>
              </button>

              <button
                onClick={handleAccrueYield}
                className="py-4 px-6 rounded-xl bg-sky-50 hover:bg-sky-100/80 border border-sky-200 text-sky-900 font-bold text-sm transition-all flex flex-col items-center justify-center space-y-1 group shadow-2xs active:scale-95"
              >
                <span>[ Accrue Yield ]</span>
                <span className="text-[10px] font-semibold text-sky-600 group-hover:text-sky-700">Automated Distribution</span>
              </button>

              <button
                onClick={handleTriggerPayout}
                className="py-4 px-6 rounded-xl bg-purple-50 hover:bg-purple-100/80 border border-purple-200 text-purple-900 font-bold text-sm transition-all flex flex-col items-center justify-center space-y-1 group shadow-2xs active:scale-95"
              >
                <span>[ Trigger Payout ]</span>
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
            <span className="text-[10px] font-mono text-slate-400">/api/v1/telemetry/stream</span>
          </div>

          <div className="flex-1 p-4 font-mono text-xs overflow-y-auto space-y-3 max-h-[500px] bg-slate-50/30">
            {telemetryLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl bg-white border border-slate-200/70 shadow-2xs space-y-1.5">
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
            ● Enterprise Audit Stream Connected
          </div>
        </div>
      </main>
    </div>
  );
}
