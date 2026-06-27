# HashStaking Console - Backend Service

Asynchronous Python FastAPI service implementing the **Google Agent Payments Protocol (AP2)**, EIP-712 cryptographic signature verification, on-chain KYC Soul-Bound Token (SBT) issuance, testnet token faucet distribution, and real-time Server-Sent Events (SSE) telemetry streaming.

## 📁 Architecture Summary
```plaintext
backend/
├── main.py              # Asynchronous FastAPI API server & SSE routing entry point
├── ap2_engine.py        # EIP-712 Pydantic validation schemas & cryptographic signature engine
├── test_ap2_engine.py   # Comprehensive Pytest test suite for mandate engine & API endpoints
├── requirements.txt     # Python project dependencies
└── .env                 # Local environment configuration
```

## 🚀 Key Endpoints
* **`GET /health`**: Live telemetry ping reporting network state and HashKey Testnet RPC status.
* **`POST /api/v1/mandates/verify`**: AP2 Mandate Engine route verifying EIP-712 cryptographic signatures (`AgentPaymentMandateRequest`). Returns authorized `agentId` and `userAddress`.
* **`POST /api/v1/mandate/verify`**: Legacy verification route supporting Phase 1 workflows and mandate dictionaries.
* **`POST /api/v1/registry/verify`**: Institutional Onboarding Funnel route that verifies corporate credentials and mints an on-chain compliance Soul-Bound Token (`SBTRegistry`).
* **`GET /api/v1/registry/check-status`**: Stateless query against on-chain/in-memory compliance identity records.
* **`POST /api/v1/faucet/claim`**: Backend Faucet Dispenser routing mock USDT minting transactions from treasury credentials to new investor wallets.
* **`GET /api/v1/telemetry/stream`**: Real-time Server-Sent Events (SSE) streaming live logs, cryptographic verification events, and blockchain transactions directly to the frontend console.

## 🛠️ Local Setup & Testing
1. Activate virtual environment:
   ```bash
   source ../venv/bin/activate
   ```
2. Run the Pytest test suite:
   ```bash
   pytest
   ```
3. Start local development server:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000 --reload
   ```
