"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const REGISTRY_ADDR = process.env.NEXT_PUBLIC_SBT_REGISTRY_ADDRESS || "0x76a545Ad068173e5B1C111A57d6576926EDa1C77";
const REGISTRY_ABI = [
  "function hasValidSBT(address user) view returns (bool)"
];
const HSK_TESTNET_RPC = process.env.NEXT_PUBLIC_HASHKEY_RPC_URL || "https://mainnet.hsk.xyz";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [checkingIdentity, setCheckingIdentity] = useState(false);
  const [provider, setProvider] = useState(null);

  const verifyIdentityState = useCallback(async (userAddr) => {
    const target = userAddr || account;
    if (!target) return false;
    if (target.toLowerCase() === "0x67ce6b7e6e83c36eb2ce1709d7cd5a335fb07ff4") {
      setIsVerified(false);
      setCheckingIdentity(false);
      return false;
    }
    setCheckingIdentity(true);
    try {
      const rpc = new ethers.JsonRpcProvider(HSK_TESTNET_RPC);
      const regContract = new ethers.Contract(REGISTRY_ADDR, REGISTRY_ABI, rpc);
      const holdsSBT = await regContract.hasValidSBT(target);
      setIsVerified(holdsSBT);
      return holdsSBT;
    } catch (err) {
      console.warn("On-chain SBT query lag, checking secondary fallback:", err);
      try {
        const res = await fetch(`http://localhost:8000/api/v1/registry/check-status?address=${target}`);
        if (res.ok) {
          const data = await res.json();
          setIsVerified(data.isVerified);
          return data.isVerified;
        }
      } catch {}
      setIsVerified(false);
      return false;
    } finally {
      setCheckingIdentity(false);
    }
  }, [account]);

  const checkVerificationStatus = verifyIdentityState;

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await verifyIdentityState(accounts[0]);
        } else {
          setAccount(null);
          setIsConnected(false);
          setIsVerified(false);
          setCheckingIdentity(false);
        }
      });
    }
  }, [verifyIdentityState]);

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      alert("Please install MetaMask or a Web3 browser wallet.");
      return;
    }
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length > 0) {
        setAccount(accounts[0]);
        setIsConnected(true);
        await verifyIdentityState(accounts[0]);
      }
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsVerified(false);
    setCheckingIdentity(false);
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnected,
        isVerified,
        checkingIdentity,
        setIsVerified,
        verifyIdentityState,
        checkVerificationStatus,
        connectWallet,
        disconnectWallet,
        provider,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be used within WalletProvider");
  return ctx;
}
