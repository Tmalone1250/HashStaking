# HashStaking Console - Sovereign AI Agent & RWA Compliance Platform

[![HashKey Chain Mainnet](https://img.shields.io/badge/HashKey_Chain-Mainnet_177-0052FF?style=for-the-badge)](https://mainnet.hsk.xyz)
[![Google AP2](https://img.shields.io/badge/Protocol-Google_AP2_Mandates-4285F4?style=for-the-badge)](https://github.com/google/agent-payments-protocol)
[![OpenZeppelin](https://img.shields.io/badge/Security-OpenZeppelin_Pausable-4E5EE4?style=for-the-badge)](https://openzeppelin.com)
[![Next.js](https://img.shields.io/badge/Frontend-Next.js_16-000000?style=for-the-badge)](https://nextjs.org)
[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.110-009688?style=for-the-badge)](https://fastapi.tiangolo.com)

The **HashStaking Console** is an institutional-grade yield management and compliance platform designed for real-world asset (RWA) treasuries and autonomous AI agents operating on the **HashKey Chain**. It bridges on-chain regulatory compliance gates (**Soul-Bound Tokens / SBTs**) with off-chain asynchronous payment execution protocols (**Google Agent Payments Protocol / AP2**), allowing authorized AI agents and corporate treasurers to securely allocate and manage capital.

---

## 🏛️ Executive Overview & End-to-End Workflow

```
+--------------------------------------------------------------------------------------------------+
|                                    INSTITUTIONAL INVESTOR / AGENT                                |
+--------------------------------------------------------------------------------------------------+
                                                  |
                     1. Connect Wallet & Auto-Switch to HashKey Mainnet (177)
                                                  v
+--------------------------------------------------------------------------------------------------+
|                                  FRONTEND CONSOLE (Next.js 16)                                   |
|  - "Executive Calm" Light Schema (#F8FAFC)        - Stateless On-Chain Identity Verification     |
|  - Real-Time SSE Agent Telemetry Stream           - Flexible Capital Allocation Gate (Deposit)   |
+--------------------------------------------------------------------------------------------------+
         |                                                                                |
         | 2. Unverified? Submit Compliance Credentials                                   | 4. EIP-712 Mandate
         v                                                                                v
+--------------------------------------------------------------------------------------------------+
|                                   FASTAPI BACKEND & AP2 ENGINE                                   |
|  - EIP-712 Pydantic Validation Schemas            - eth-account Cryptographic Signature Recovery |
|  - Automated Faucet Dispenser (+1,000 USDT)       - SSE Telemetry Event Dispatcher               |
+--------------------------------------------------------------------------------------------------+
         |                                                                                |
         | 3. Issue Compliance Identity SBT                                               | 5. Verified Execution
         v                                                                                v
+--------------------------------------------------------------------------------------------------+
|                              HASHKEY CHAIN MAINNET SMART CONTRACTS                               |
|  - SBTRegistry.sol: Single source of truth for institutional identity                            |
|  - CompliantYieldVault.sol: Pausable yield engine with 25-hr oracle circuit breaker              |
|  - mockUSDT.sol: 6-decimal ERC-20 pegged liquidity token                                         |
+--------------------------------------------------------------------------------------------------+
```

---

## 🌐 Live HashKey Mainnet Deployment (Chain ID: `177`)

All contracts are compiled, tested via Foundry, and deployed live on the **HashKey Chain Mainnet** (`https://mainnet.hsk.xyz`).

| Component | Contract Address | HashKey Explorer |
| :--- | :--- | :--- |
| **`mockUSDT`** | `0xF0e9f136cb74045020671836ee8dC894E2671b59` | [View Explorer](https://explorer.hsk.xyz/address/0xF0e9f136cb74045020671836ee8dC894E2671b59) |
| **`SBTRegistry`** | `0x76a545Ad068173e5B1C111A57d6576926EDa1C77` | [View Explorer](https://explorer.hsk.xyz/address/0x76a545Ad068173e5B1C111A57d6576926EDa1C77) |
| **`CompliantYieldVault`** | `0x82223DaFAD9233c52718435DA4690DE75aA7EA84` | [View Explorer](https://explorer.hsk.xyz/address/0x82223DaFAD9233c52718435DA4690DE75aA7EA84) |

---

## 📦 Detailed System Breakdown

### 1. On-Chain Smart Contracts (`/contracts`)
Built with **Foundry** and **OpenZeppelin** standards to guarantee unbreakable security and compliance:
* **Regulatory Onboarding Gate (`SBTRegistry.sol`)**: Non-transferable ERC-721 Soul-Bound Token acting as the definitive on-chain identity record. Every mutating operation on the vault checks `SBTRegistry.isVerified(msg.sender)`. Unverified wallets are blocked at the EVM level with custom error `'Transaction Blocked - Missing Regulatory Identity SBT'`.
* **Oracle Freshness Circuit Breaker**: Real-world real estate properties require accurate off-chain valuation feeds. The vault tracks `lastOracleUpdateTimestamp` and enforces `priceIsFresh()`. If the valuation feed goes stale (> 25 hours), all deposit, withdrawal, and yield reward operations halt automatically.
* **OpenZeppelin Pausable Control**: Global administrative emergency lock down (`pauseVault` / `unpauseVault`) restricting hot operational paths (`whenNotPaused`).
* **Emergency Wind-Down Exemption**: If an underlying property is liquidated or sold, administrators toggle `isAssetWindDownActive = true`. Investors can invoke `emergencyWithdraw()` to extract 100% of their underlying principal immediately—even if the vault is globally paused.
* **Zero-Pool Division Protection & Dust Skimmer**: Mathematical guards preventing division-by-zero runtime panics during programmatic reward injections when `totalStaked == 0`. Administrative endpoint `skimDust` safely sweeps trailing token balances without touching user principal.

### 2. Off-Chain Mandate Engine & Backend (`/backend`)
Asynchronous **FastAPI** Python service implementing the **Google Agent Payments Protocol (AP2)**:
* **EIP-712 Pydantic Validation (`ap2_engine.py`)**: Strict schema validation (`AgentPaymentMandateRequest`, `EIP712Domain`, `PaymentMandateMessage`) enforcing EVM regex patterns, future expiration timestamps, and anti-replay nonces.
* **Cryptographic Verification Engine**: Uses `eth-account` to encode structured typed messages and perform elliptic curve public key recovery (`Account.recover_message`), ensuring strict case-insensitive address verification.
* **Consolidated Flat Architecture**: Designed for lean operational overhead, exposing verified endpoints (`POST /api/v1/mandates/verify`), compliance registry checks (`GET /api/v1/registry/check-status`), and institutional onboarding minting (`POST /api/v1/registry/verify`).
* **Automated Mock Faucet Dispenser**: Secure backend route (`POST /api/v1/faucet/claim`) dispatching +1,000 `mockUSDT` directly to onboarded investor wallets.
* **Real-Time SSE Telemetry Stream**: Server-Sent Events endpoint (`GET /api/v1/telemetry/stream`) pushing live execution logs, verification status, and transaction hashes directly to the frontend console.

### 3. Institutional Corporate UI (`/frontend`)
Built with **Next.js 16** and styled with the **"Executive Calm"** corporate aesthetic (`#F8FAFC` light background, subtle slate borders, high-contrast typography, and institutional terminology):
* **Network Auto-Switching Engine (`WalletContext.js`)**: Automatically intercepts Web3 connections and prompts MetaMask to switch or add HashKey Chain Mainnet (`Chain ID: 177`).
* **Stateless On-Chain Identity Persistence**: Bypasses browser localStorage cache. Upon wallet connection, the frontend queries `SBTRegistry.isVerified()` and backend telemetry. Verified institutions instantly bypass KYC screens and drop straight into the management console.
* **Institutional Onboarding Funnel (`/onboarding`)**: 4-step interactive workflow collecting corporate entity details, jurisdiction, and legal representatives, dispatching backend verification and on-chain SBT minting.
* **Flexible Capital Allocation Gate (`DepositModal.js`)**: Dynamic modal featuring custom numeric input, automated balance querying, maximum allowance calculation, and seamless 6-decimal token approval.
* **Yield Injection Bridge**: Interactive dashboard action enabling protocol treasurers to inject yield rewards (`injectYieldRewards`) with real-time state synchronization.

---

## ⚡ Quickstart & Development Guide

### Prerequisites
* **Node.js** `>= 18.0.0`
* **Python** `>= 3.10`
* **Foundry** (`forge`, `cast`, `anvil`)

### 1. Smart Contracts
```bash
cd contracts
forge test -vvv       # Execute full unit test suite
forge build           # Compile contract artifacts
```

### 2. Backend API Service
```bash
cd backend
source ../venv/bin/activate    # Activate virtual environment
pytest                         # Run backend verification unit tests
uvicorn main:app --port 8000 --reload  # Launch local FastAPI server
```

### 3. Frontend Console
```bash
cd frontend
npm install           # Install project dependencies
npm run dev           # Launch Next.js dev server on http://localhost:3000
```

---

## 📚 Repository Structure
```plaintext
HashStaking/
├── README.md               # Master Project Overview & Specifications
├── .gitignore              # Configured exclusions for node_modules, venv, cache, and secrets
├── contracts/              # Foundry smart contract workspace
│   ├── src/                # Solidity contracts (CompliantYieldVault, SBTRegistry, mockUSDT)
│   ├── test/               # Comprehensive unit and integration testing suites
│   ├── script/             # Deployment and mainnet interaction scripts
│   └── README.md           # Contract specific documentation
├── backend/                # Python FastAPI backend service
│   ├── main.py             # Server entry point, API routes & SSE streaming
│   ├── ap2_engine.py       # EIP-712 AP2 validation schemas & signature recovery logic
│   ├── test_ap2_engine.py  # Pytest test suites
│   ├── requirements.txt    # Python dependencies
│   └── README.md           # Backend specific documentation
├── frontend/               # Next.js corporate UI web application
│   ├── src/                # Pages, components, and WalletContext providers
│   ├── public/             # Static assets
│   └── README.md           # Frontend specific documentation
└── docs/                   # Detailed architectural engineering specifications
```
