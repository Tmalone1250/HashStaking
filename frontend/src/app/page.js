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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-200/80 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex items-center justify-between bg-white/80 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white shadow-md shadow-emerald-600/20">
            H
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            HashStaking Console
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 font-semibold tracking-wide">
            Institutional Yield
          </span>
        </div>

        <nav className="flex items-center space-x-6">
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="px-5 py-2 rounded-lg border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-sm transition-all shadow-sm active:scale-95"
            >
              Connect Wallet
            </button>
          ) : (
            <div className="flex items-center space-x-4 bg-slate-50 px-4 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{formatAddress(account)}</span>
              </span>
              <button
                onClick={() => router.push("/dashboard")}
                className="text-xs bg-emerald-600 text-white px-3 py-1 rounded font-bold hover:bg-emerald-700 shadow-sm transition-colors"
              >
                Enter Console
              </button>
              <button
                onClick={disconnectWallet}
                className="text-xs text-rose-600 hover:text-rose-700 font-semibold ml-2 transition-colors"
              >
                Disconnect
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* SaaS Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 max-w-5xl mx-auto my-auto py-24">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 mb-8 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>HashKey On-Chain Horizon Certified Enterprise Partner</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
          Institutional Permissioned <br />
          <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Yield Settlement Platform
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mb-12 leading-relaxed">
          Experience constant time asset settlement gated by strictly verified regulatory compliance credentials. Designed for enterprise custody and security.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6 w-full max-w-md">
          <button
            onClick={handleLaunchApp}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-xl shadow-emerald-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            Launch Console →
          </button>
          
          <a
            href="https://testnet.hsk.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-base transition-all text-center shadow-sm"
          >
            Explore Testnet
          </a>
        </div>
      </main>

      {/* Footer Minimal */}
      <footer className="border-t border-slate-200 py-6 px-8 text-center text-xs text-slate-500">
        HashStaking Console Architecture • Built for enterprise security on HashKey Chain
      </footer>
    </div>
  );
}
