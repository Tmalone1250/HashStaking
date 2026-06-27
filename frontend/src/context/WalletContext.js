"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";

const REGISTRY_ADDR = "0x7AE9a2BdDa9b827483be932a6BE1372867B460c7";
const REGISTRY_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function hasValidSBT(address user) view returns (bool)"
];
const HSK_TESTNET_RPC = "https://testnet.hsk.xyz";

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
    setCheckingIdentity(true);
    try {
      const rpc = new ethers.JsonRpcProvider(HSK_TESTNET_RPC);
      const regContract = new ethers.Contract(REGISTRY_ADDR, REGISTRY_ABI, rpc);
      const [bal, valid] = await Promise.all([
        regContract.balanceOf(target),
        regContract.hasValidSBT(target)
      ]);
      const holdsSBT = bal > 0n || valid;
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
