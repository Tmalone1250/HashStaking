"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [provider, setProvider] = useState(null);

  const checkVerificationStatus = useCallback(async (userAddr) => {
    const target = userAddr || account;
    if (!target) return false;
    try {
      const res = await fetch(`http://localhost:8000/api/v1/registry/check-status?address=${target}`);
      if (res.ok) {
        const data = await res.json();
        setIsVerified(data.isVerified);
        return data.isVerified;
      }
    } catch (err) {
      console.warn("Backend registry status check error:", err);
    }
    return false;
  }, [account]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(web3Provider);

      window.ethereum.on("accountsChanged", async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setIsConnected(true);
          await checkVerificationStatus(accounts[0]);
        } else {
          setAccount(null);
          setIsConnected(false);
          setIsVerified(false);
        }
      });
    }
  }, [checkVerificationStatus]);

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
        await checkVerificationStatus(accounts[0]);
      }
    } catch (err) {
      console.error("Connection failed:", err);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setIsConnected(false);
    setIsVerified(false);
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        isConnected,
        isVerified,
        setIsVerified,
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
