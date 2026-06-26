"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "../context/WalletContext";

export default function LandingPage() {
  const router = useRouter();
  const { isConnected, account, connectWallet, disconnectWallet } = useWallet();

  const handleLaunchApp = async () => {
    if (!isConnected) {
      await connectWallet();
    } else {
      router.push("/dashboard");
    }
  };

  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-900">
      {/* Top Navigation Bar */}
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex items-center justify-between bg-[#0B0F19]/80">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
            H
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            HashStaking Console
          </span>
          <span className="text-xs px-2 py-0.5 rounded border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 font-medium">
            Sovereign Institutional Yield
          </span>
        </div>

        <nav className="flex items-center space-x-6">
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="px-5 py-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-semibold text-sm transition-all shadow-sm hover:shadow-emerald-500/10 active:scale-95"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center space-x-4 bg-[#111827] px-4 py-1.5 rounded-lg border border-white/10">
              <span className="text-xs font-mono text-emerald-400 flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{formatAddress(account)}</span>
              </span>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-xs bg-emerald-500 text-slate-950 px-3 py-1 rounded font-bold hover:bg-emerald-400 transition-colors"
              >
                Enter Console
              </button>
              <button
                onClick={disconnectWallet}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium ml-2 transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* SaaS Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto my-auto py-24">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-slate-300 mb-8 backdrop-blur-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          <span>HashKey On-Chain Horizon Certified</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-8 leading-[1.1]">
          Institutional Permissioned <br />
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Yield Engine & AP2 Mandates
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mb-12 leading-relaxed">
          Experience zero-loop O(1) constant time reward accounting gated by strictly verified Regulatory Identity SBTs. Designed for enterprise custody calm.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-md">
          <button
            onClick={handleLaunchApp}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold text-base shadow-xl shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Launch App →
          </button>
          
          <a
            href="https://testnet.hsk.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 bg-[#111827]/80 hover:bg-[#111827] text-slate-300 font-semibold text-base transition-all text-center"
          >
            Explore Testnet
          </a>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="border-t border-white/5 py-6 px-8 text-center text-xs text-slate-600">
        HashStaking Console Architecture • Built for corporate sovereignty on HashKey Chain
      </footer>
    </div>
  );
}
