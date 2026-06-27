# HashStaking Console - Frontend Application

Next.js institutional management application tailored for corporate asset treasurers. Styled with the **"Executive Calm"** corporate schema (`#F8FAFC` light theme, slate borders, and institutional financial terminology).

## 🖥️ Key UI Modules & Features
* **Institutional Onboarding Funnel (`/onboarding`)**: 4-step compliance interview collecting corporate credentials (Legal Name, Entity Type, Jurisdiction) and triggering automated backend EIP-712 / SBT verification.
* **Network Auto-Switching Engine (`src/context/WalletContext.js`)**: Automatically intercepts MetaMask / Web3 wallet connections and switches or prompts to add the **HashKey Chain Testnet** (`Chain ID: 133`, `https://testnet.hsk.xyz`).
* **On-Chain State Persistence**: Bypasses local storage by directly querying `SBTRegistry.isVerified()` and backend registry status. If already verified, users bypass onboarding directly to the dashboard.
* **Sovereign Yield Dashboard (`/dashboard`)**: Displays real-time staked principal, dynamic APY, pending USDT rewards, and live oracle property valuation metrics ($100k baseline).
* **Flexible Capital Allocation Gate (`DepositModal.js`)**: Supports custom decimal deposit amounts with dynamic `MAX` balance detection and automated ERC-20 approval flows.
* **Yield Injection Bridge**: Allows institutional administrators to inject reward yield dynamically into the `CompliantYieldVault` contract with automatic dashboard state refresh.
* **Real-Time Agent Telemetry Console**: Embedded live console receiving Server-Sent Events (`SSE`) from the backend to visualize autonomous agent operations, verification audits, and faucet distributions.

## ⚙️ Configuration & Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Start local development server (runs on `http://localhost:3000`):
   ```bash
   npm run dev
   ```
3. Build for production deployment:
   ```bash
   npm run build
   ```
