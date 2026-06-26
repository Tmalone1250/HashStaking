# **HashKey Compliance-Aware Yield Settlement Engine**

## **Master Specification & Implementation Roadmap**

This specification details the architecture, math, data models, off-chain settlement structures, and step-by-step development roadmap for building a standalone **Compliance-Aware Yield Settlement Engine** on the **HashKey Chain**.

## **1\. Executive Summary & Narrative**

Trillions in institutional treasury capital remain on the sidelines because it cannot legally interact with anonymous, compliance-blind public DeFi networks.

This project implements an institutional back-office staging portal and settlement engine designed for **HashKey Chain**. It bridges the gap between regulatory requirements and on-chain efficiency through three core components:

1. **On-Chain Gated Staking (CompliantYieldVault.sol):** A vault that restricts deposits and transfers to identities validated by Soul-Bound Token (SBT) compliance registries.  
2. **Model B Reward-Debt Math:** A gas-efficient yield tracking system that eliminates loops, ensuring execution scales smoothly regardless of user density.  
3. **Automated Settlement (Google AP2 / HSP Flow):** An off-chain cryptographic worker pattern validating mandates before submitting automated on-chain payments.

## **2\. Technical Stack & Network Profiles**

### **🌐 Network Node Configurations**

The system targets the EVM-equivalent rollup of the HashKey Chain:

* **HashKey Chain Mainnet:**  
  * Network Name: HashKey Chain  
  * RPC Endpoint: https://mainnet.hsk.xyz  
  * Chain ID: 177  
  * Native Gas Token: HSK  
  * Block Explorer: https://hashkey.blockscout.com  
* **HashKey Chain Testnet:**  
  * Network Name: HashKey Chain Testnet  
  * RPC Endpoint: https://testnet.hsk.xyz  
  * Chain ID: 133  
  * Native Gas Token: HSK  
  * Block Explorer: https://testnet-explorer.hsk.xyz

### **⚙️ L2 Standard Predeployed System Contracts**

For interactions passing up to L1 or monitoring execution metrics, the system binds to standard OP-Stack predeployed system contracts:

* L2CrossDomainMessenger: 0x4200000000000000000000000000000000000007  
* GasPriceOracle: 0x420000000000000000000000000000000000000F  
* L2StandardBridge: 0x4200000000000000000000000000000000000010  
* OptimismMintableERC20Factory: 0x4200000000000000000000000000000000000012

## **3\. On-Chain Math Core: Model B Reward Accounting**

To achieve bank-grade efficiency and prevent ![][image1] gas-scaling attacks (where iterating over users to distribute yield causes transaction failure), the CompliantYieldVault.sol contract implements the **Model B Reward-Debt Math** pattern.

### **Mathematical Formulations**

Let:

* ![][image2] be the staked balance of user ![][image3] inside the vault.  
* ![][image4] be the total active stake across all participants:  
  ![][image5]  
* ![][image6] be the globally tracked **Accumulated Reward Per Share**, which is updated monotonically whenever new yields ![][image7] are injected:  
  ![][image8]  
* ![][image9] be the individual user's **Reward Debt**, representing the historical yield accrued prior to their entry or state changes:  
  ![][image10]

### **State Changes**

#### **1\. Real-time Reward Claim Calculation**

At any block, the pending, unclaimed reward ![][image11] for user ![][image3] is evaluated instantly without loops:

#### **![][image12]2\. Executing a Deposit (![][image13])**

When user ![][image3] deposits an additional amount ![][image13], the state transition is structured as follows:

1. Harvest pending rewards to prevent dilution:  
   ![][image14]![][image15]  
2. Increment the user's active stake:  
   ![][image16]  
3. Re-calibrate the reward debt to match the new stake magnitude:  
   ![][image17]

#### **3\. Executing a Transfer (![][image18])**

To prevent yield leakage or regulatory evasion across accounts:

1. Update pending accounting for both sender ![][image6] and receiver ![][image19] using the active accumulator.  
2. Transfer the balance: ![][image20], ![][image21].  
3. Adjust the respective debts:  
   ![][image22]![][image23]

## **4\. HSP / AP2 Cryptographic Settlement Flow**

To qualify for premium positioning within the DeFi Track, the off-chain layer utilizes Google's **Agent Payments Protocol (AP2)** framework. This abstracts the raw transaction complexity away from the user, presenting human-readable intents.

### **👥 Five-Role System Layout**

 \[User\] ──────────► \[Shopping Agent\] ──────────► \[Merchant\] (Vault Contract)  
   │                      ▲                           ▲  
   ▼                      │                           │  
 \[Credential Provider\] ───┴─────────────────────► \[Merchant Payment Processor\]

1. **The User (Client):** Consents to yield staging, selects presets, and grants ECDSA signatures.  
2. **The Shopping Agent (SA \- Python Engine):** Scans the chain, calculates optimal yield thresholds, and bundles interaction parameters.  
3. **The Merchant (M \- Yield Vault Contract):** Operates on-chain, exposing liquidity sinks for the gated stablecoin.  
4. **The Credential Provider (CP \- Local Key Manager):** Protects private keys, authorizing signed structured payloads.  
5. **The Merchant Payment Processor (MPP \- Automated Relayer):** Runs secondary verification, verifies regulatory identity lists, pays HSK gas, and commits the execution to the network.

### **🏗️ EIP-712 Mandate Schemas**

Off-chain transactions are signed as typed structured data to prevent signature replay attacks.

{  
  "types": {  
    "EIP712Domain": \[  
      {"name": "name", "type": "string"},  
      {"name": "version", "type": "string"},  
      {"name": "chainId", "type": "uint256"},  
      {"name": "verifyingContract", "type": "address"}  
    \],  
    "PaymentMandate": \[  
      {"name": "user", "type": "address"},  
      {"name": "vault", "type": "address"},  
      {"name": "amount", "type": "uint256"},  
      {"name": "nonce", "type": "uint256"},  
      {"name": "expiration", "type": "uint256"}  
    \]  
  },  
  "primaryType": "PaymentMandate",  
  "domain": {  
    "name": "HashKey Compliance Settlement",  
    "version": "1.0",  
    "chainId": 177,  
    "verifyingContract": "0xVaultAddressHere..."  
  },  
  "message": {  
    "user": "0xUserWalletAddress...",  
    "vault": "0xVaultAddress...",  
    "amount": "1000000000",  
    "nonce": "1",  
    "expiration": "1782241600"  
  }  
}

## **5\. Development Roadmap & Trello Setup**

### **🔴 Phase 1: On-Chain Core Engineering (Days 1–4)**

* **Task 1.1: Standardize Ingestion Mocks**  
  * Write an ERC-20 mockUSDT.sol contract that exposes basic mint/burn handles for local testing.  
* **Task 1.2: Model B Core Logic**  
  * Implement the global accumulator accRewardPerShare inside CompliantYieldVault.sol.  
  * Ensure mathematical precision (using scale factor ![][image24] to avoid fractional rounding truncation).  
* **Task 1.3: Compliance Gate Integration**  
  * Add a mapping mapping(address \=\> bool) public isWhitelisted representing the verified identities.  
  * Apply a modifier onlyVerified to the deposit() and transfer() functions that throws the explicit revert string:  
    "Transaction Blocked \- Missing Regulatory Identity SBT"

### **🟡 Phase 2: Off-Chain Mandate Engine & Backend (Days 5–8)**

* **Task 2.1: FastAPI Setup**  
  * Initialize the Python API with Pydantic payload models to receive signing packets.  
* **Task 2.2: Cryptographic Helper Scripting**  
  * Write ap2\_engine.py to compile, encode, and verify EIP-712 formatted payloads.  
* **Task 2.3: The Compliance Guard Worker**  
  * Create a mock database query layer representing the institutional back-office database checking KYC files before executing the final transaction.

### **🟢 Phase 3: "Executive Calm" Single-Screen UI (Days 9–12)**

* **Task 3.1: Dashboard Layout**  
  * Implement the Next.js UI using CSS-backed dark theme slate values (\#0B0F19) and soothing Jade Green highlights (\#10B981) for positive verification status.  
* **Task 3.2: Wallet Handoff**  
  * Connect Web3 modal support (MetaMask hooks) to sign off-chain mandates and prompt live on-chain operations.  
* **Task 3.3: Visualizing the Swarm Logs**  
  * Create the "Reassurance Engine" console card, mapping processing states in real-time. This provides clear, streaming steps to reassure middle-managers.

### **🔵 Phase 4: Mainnet Deployment & Submission (Days 13–16)**

* **Task 4.1: Dry-Run and Funding**  
  * Deploy mock contracts to testnet and verify complete off-chain-to-on-chain lifecycle.  
* **Task 4.2: Mainnet Production Release**  
  * Deploy clean, optimized contracts to HashKey Chain Mainnet (Chain ID 177).  
* **Task 4.3: Explorer Verification**  
  * Verify bytecode through standard explorer validation on hashkey.blockscout.com.  
* **Task 4.4: Deliver Pitch Assets**  
  * Shoot the high-fidelity 60-second execution run showing the compliance gate blocking Wallet B and resolving Wallet A seamlessly. Submit complete artifacts to DoraHacks.

## **6\. Verification Checklist for Antigravity**

Before compiling and releasing code milestones, the Antigravity agent must verify these protocols:

1. **Never use generic error codes:** All reverts inside CompliantYieldVault.sol MUST emit "Transaction Blocked \- Missing Regulatory Identity SBT" when failing verification.  
2. **Zero-Loop Rule:** No operations inside deposit, staking, unstaking, or transfer functions may utilize for or while loops referencing user arrays.  
3. **Strict Path Conformity:** Any state serialization or caching files generated by the backend must stay confined to our verified project folders.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC0AAAAbCAYAAADoOQYqAAADVUlEQVR4Xu2WS2hTQRSGbx8ivsAqITVpe29jIK0iKPEBiuJjIyIorehCxRcoKCqoGxV0J9KFQhEXChV8LCyUFq1I3VkL6sKFoAiiCC2KWnEjIiKlfqeZSScnSdNYu8sHh3vvf86cOTN3Zu71vBKeV1NTE00mk1O0XohIJDI9FovVab1opPPa2tqlQRCspZg52q+RTqEnFArN1L5CxOPxqb7vP6D9Au0bFxQYp3EXSW5xPY9d4H4A62YQER0v0GYacc+xhdo3Xshfj70kR5X2jQmNDjCzb7EVri4zje8FCfvxzXZ9Ar4z2CWtFwv5z5GnTet5IbgF+05RDdon4FuPDeO/6Ooyy+ifZaZc/V+QWSbPj3w1ZEBgsxQkM619FlOcxDxzdTo6Sie9rjYRZGnqicnCvPpP2JcCO7+SmCHsqyvSyWO0FlezyBp3N7EsLbQkt5VOWAbEnJb9ofUM6PCkzCCBl7XPRV6/menXVpNB8vwr1xtCO0LO41wHsf3YNawNa5WBY826jYDehA1xW6Z9aRjZIymGDjZrnwtxe03R7Varr5dxZLc1R9jIhuL6AftJ7HLr5/kp1jHaYhROqNWSM99JZZP/liCShrXfhcJ6TNE7rcarX2TapgsysUkGuQOrFr+8cteP9h6742oWciVM0cu0b4RwODzDFDLMY4X2W6QIE/fOc9Yjz0tEr8vzUUDfZYpebDWKmW9yZS0pAX2eyblB+9L4qVHLGhprc9w1HR1WemA6WOXqFvQb+L9xW241P3WmD/OWQ05oGnyN4g/UtyIDnPdMx7Krs/BTm0gK7vaczoVEIjHL+Da5usVPredORyrj+Q320Piv6l8EtJWm6GpXz4A1tIagP1K8p4piINv91DHXGeT4EgrE9GPHtC6/A2ZAJxwtago6hDVwf9NtI6Dv8dWxmhPZ/QR+pEEv97uD1EnRjr2SdanjXYi5jt3WOjm2mqIbHbmC5ydYB3m7ci0RfFfMBBYmGo3OJdE2Gp3ietBshLyb00L8OmxQTiLlKsu35OTvUb6wWodyeXPka9KO/w6d9DE7+7ReLOTYQq4BTy3TScEshT6tFws57pNro9YnDTpslQ2m9fFiNv1ZrU860mnez+8YUHBVUOjPrkSJEiUmxF+r/t1hO6/4vgAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAaCAYAAABVX2cEAAABgElEQVR4Xu2TPUvDUBiF6xeIiB9IRZq2+WgGBcGhmy7V6uDiJKKLDoIigqsOKoiTS0UnJxFEXHXSTff+AHFyEFdxF9HnlSRcXprQugk9cLjtec99epMmqdS/k+/7Pfl8fsK27ZFisdghWaFQGMxkMl26myjHcXaAvOBTgBesT2Ql1mo6ne7W/Vix4RDAvXkCQA75B34wu4miPI6/2TusZ3JC8gOdxwpQRWDhPdIzgGWdx4oN5wLDq3oGaKbWj8SKy1gPYOI3ADe5XG5O9+pVK8AjQF8GVHzHrE2X6xIn6sfTgE8AfQbAKdVZZt5pZpFc1x3TmQjIpsDYuBFmnuf18v0W95ndXxEOybOlc1HwFsjJZvWspthwFmyYVHmZ7DWbzfpB1E62jxfIr8xuJAZVvIufKR6z7uFL/Mi/ORr25N0UsMzorZmMSPIMySr3gs/zeJtLXyRqUdWUvJvA3i3LGtCzhsWPrAC7Zi3J/dTzhgRkKbjMLT37k4C5OmuqqQT9ANVmV9mMLpL5AAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAbCAYAAACwRpUzAAAAsklEQVR4XmNgoAtgVFBQiFRUVBRHl2CQl5dPAeL/QAWJ6HIMMjIyqnJycmHo4viBkpKSGggDmYwoEkB7moF4FhA/BdrXCJcAcgyAgt1QRdeBeDGyrmSg09WBiixALpWVlfWDSyIpmgLEn4GKOFAkQAJAiddAvARFAgSAfguBet5dWlpaBsivg0uCHATET4BMZiDdA3SDPlwSqMMDKPgCSE8E6qqHSyApEAAGghy6+CjABwAFZSOAHqJkDwAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAbCAYAAADlJ3ZtAAACr0lEQVR4Xu2WO2hUQRSG140vRHwEV2Vfd19FXAQ1iygqmqdgo4VvMFqkCD5A0EIlURALsYnGRhERQW0sxC7BQgOxMoKVBLEIKIIoSKxF9Du5M2b25C4SErxB7g+HmfOff2b+nZm798ZiEf4xSqXSkmw2u9XzvDWVSmWecMVicWUymVyktaEil8udx+QocRPD92lH4JpohxOJxGKtDw0YuoLBAXcHMZqDHyNeuNpQgZktxC+8Neia7DD8Zc2HBoz2ill7R3UNw62aDw0YuidmiU5dw2h70I8IDRxzlzEr8QmDTzOZzG6tmy2IY/gaRn86piX6qdVp8awAO7qcaMN4H0Z/GMMtWjfTYM2jrDNE7NW1KuTz+XWaEzDwpJjF+HGHayR/5upqYSpaEEf/DS+eLvwBk62W/1bNC8xbTHZ2l+Xon4W/5epqYSpano+N6Ec1XwXMHiReaV7A4G7irfwTpNPpFP2LxGt5+Bhz2Oro74C77flvvQN/0TbAXaXWyS7utLz8MOKOzQNhFpHda1Z8K9xHFi45tBzVGG+4FY5uP9xLTCyTnP57M2aSlrzFmF9Iu0/md2pP4I7YPBCIhoke4h3i656/Iw+IQY5mrdI2EiMOVUf+lXFtjmZITitAO9essU0SNMfIH5ra+H1NpVJpRz8ZDG6XtlAoLJVfS5xjokNQc5RUtKeZ9K7NOcbt5F/oxiUvl8vzyb+jK9fQfo6ZeaVGnJA+662n/8ZqZwRM+Fh2RL6+aLuITe4iGOyA6wvSkjcTg1LjE3QB2g9ikrgAf4r2hpjnCtXb+aYFz/9+OGMmH7+jLDpA3k17SU4lNrFzVVp5SOn3Z/07/oh4TvRQ20zs8fyr11u14HRgjnmDy8kusViTNW8RpI35dzxv63zQZ2yBa7JqQhYhQoQI/wV+A7kBuIjmlBYeAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAABBCAYAAABsOPjkAAAEM0lEQVR4Xu3dP4gcVRgA8DtFUfwXkfPQu92Z3Vs8OLHxQEFBQhAUBUlQMGIlKAo2grEQiaKSFArRJoUKImgrSsBCEhFjISpCsEgiBpNWUwTtjIV+LztLJo/by268dSfy+8HHzHzfm7cz3cfbndmZGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACgIYqi+PtCI58LAIAJiMbr9ojTVRP2QF5fy+LiYq/dbn8QsTuvAQAwAdGo7agatl/z2nqq8ZfkeQCAi8by8vI10dQcingz4uuILfmYpohr+61q2l7Ka8OsrKxcnlbb8nySVusiTkTsiTiaVuTKsrwvHwcAMDWrq6uXRaNyIHZn03Gr1XooNUTZsMaoGqzUsP0VjdWdeX1cMc/xbrfbTvvR1F2Z5p2fn78qHwcAMDXRoHwf8UWW+6Z+3DTRqF1RNW3/qrGMebYW2Wpi5F6tHwMATF00LMcifs9yI/2of5riGv9IDVs0WE/ntVHFuU/EHO+lVcZBbrDaBgDQGO12+/poWj4brFhF7MzHbKT4vHvjM/YPi6h/np8zTDRcb1fXfDivjSrOPVW79+N5HQCgMaJZ2RYN0L7Ynk5fOeb1ccQcu3q93lye32jV7+/ONFt5bVTpXtNv4YrqYYZ6bWFh4Yb6MQDAfy4alUfzXDQtf3a73evSfrvd/jSvD6xXizmez3MD8ZmbIjavF/k564nreKsY8zUfSZzzw8y5r/qYTfdeOwYAmL5oUI7WVsJmo1l6MT0pmQ7K/qrTodrYvZErY/vzGrXXqu2H1fbUoDZJZX91bHueH0VaTYtm7+XBcczzY+S21eo3pXseHAMATEXRf+DgcGq4onn5KrbvD2rRwDwX8U7a73Q6d8T+puq1F+mH/vXacq3JO/MAQIw5Mphngi6Nz9uXJ0cV17gn7vnb2O5M+zHX1jXGfJnnAAAaI5qVk9HEpBW1uyJeqHLvRpPzSL02WKWKpu229IRl5B6PePjc2TZefMb++tOdGy3u6+64xYN5HgCgMaJZ+S6aogfT/tLS0o2x/2TkHstraYUtmpun4nhvbF8p+79Rm+i7zNJ19Hq9a/P8MHFdt8Y5z+T59cT9vBGxK88DAHAe0UT9klbz8vww6V8L4pxjeX6YaOw2x/if0telk1zBAwD4X+p2u7cUY7zUN8Y+G3Ek4vW8Nkyr1bo5xn/k76kAAMYUTdSB4uwLbseKfC4AACag6D/NeUGRzwUAAAAAAAAAAAAbqXpX3Cd5HgAAAAA4n7Is74/YXhTFx3kNAIAG6HQ69xT9P7DfndcAAGiIaNhOzs3NXZ3nAQBoiLIsD+Y5AAAaoCiKExFbWq3WUl4DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOCi8w8O9PuyfbJ3KwAAAABJRU5ErkJggg==>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAcCAYAAAC+lOV/AAABEUlEQVR4XmNgGNRAXV2dV0FBoQBdnCggLy/fBMQ/gUxGdDm8QFFRUR2o8TsQ/5eRkRFCl8cL5OTkdgA1PgZpBmJNdHmcAOhPf6CGqUA8F6QZyHdAV4MVGBsbswI1nAZqEADa3gbSDKTD0NVhBUDFpUDFqSA20IBCqLOz0NVhAKBiCaDCvQzQ0AXy46HObkRTigmAChfJysrqIPE9oc6ejqwOAwAVWEOdiA2vRVePDJiACvZKSUmJIAtKS0vLgDQDnX0IWRwFACUrgTbHYhHngNp8E10ODsjWDFRgAZR8B1KIRQ6k+SsQf0KRAAoYAfEZIP4LNf2GqKgoD0weqLEBKPYKKgfCx4C4FNmMUTAKBiEAAG2AS/nQbI4oAAAAAElFTkSuQmCC>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAbCAYAAADyBeakAAACLUlEQVR4Xu2UT0hUURTGxxr7B4FBmAwz82acgakBC5pFy2rjrpVku6AS0Y2pmzaCCwXBlRFB0KrcBUWE2EIoWmSLSIKMtJIiQvAPhIIrF/Y7dK5z58xrnJWr98HHvPd93z3n3DvvvVgsQh0IguBWJpO5ZPV9QzqdLjLENpzn9oD1w8CaYfI7HjfgEnwPn7GhG4lE4phd91+waBJuSTEWX7N+LZD/yrrNQqFw3GmpVCqB9hGuM2zJz4eCIqcJf4M3dUefY3WeRjabPaWDv7Aeepd4DPHAelUg+FgG4DKuu5KFV20uDGQ7dIgB67m/C2/CehVgJ+SCRS7jcu+mhx9MNBQ0uCt56pyzHvocXMvlcs3WqwChe9LYk+Lc/9TC7Z4eCnJf4IqvMVgL2n04S42C71VB/89PpVKp0dcp0qOn8crXLTjuVs39gTPwHVwVjRq9MT3dmiA8ruEKFIvFQ4GeBv5F6zsE5Qd50GnkjzDcG7Qpbhu8eDV4f08S/C4NrSeg0G1t8NJ6DjR8JBlO9Kyvo43oBi74ehUIjRLqt7pDMpk8SmZFBzlvfQH6D7gcoj/VdZettwuaNxFY2OtrRmZIinEqz0M8ea2k0RNjNaCtqXfGeGVQ9A6B38G/h6kW32qxHU6mzdToVm/3eRDk8/nDbg3MisbvtJ8RxCnwywvWy4eymLXXuZ73dPnUv0Y/4RrIF1I8fvvgGOwst98/HKTxFQYZ3PM7ESFChAgRauAvlJ+3ZVqJ1JIAAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAA9CAYAAAAQ2DVeAAAFMUlEQVR4Xu3db6ieZR0H8LP5JyMlg8Zsf+7nPg9nnXnEMIeSJrVqib4aIgW9aSON4TRKx0pxQvpGfGNsMIjaIPoHwaTeJYRRKr5pmELlimIv1F5MmH9ggkjU99q577q61QPD57hn8/OBH9f1u67fc+/aux/3c577npkBAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4gzVNs6Vt223DdQAApsRoNDqR+PdwvZb9A3VN5j9O3FrXAACwDBYWFs5v2/aGNF9vjsfjZrjfy/6ziZf7PLUfT/6XugYAgMlbmabrSJmsW7duQ+avDwt65e5a0zTf6PPMv5e1z9c1AABMWJquL5evNvt8qa9Fy16ausvLfH5+/qLkR4c1AABMWJqun9d527a/yNqeeq1IozaX9V/2eeYPp/aSugYAgGXQNM3CIL8szdixVatWXVivZ+2WxB1V3ReT765rAACYsDRcvx2uFeWrz8Q/B2v/yLCiyg+1bbujKgEAYJLScF2TeD3xm7eJN0rT1temMdtY50XTNL/P+vbE3szH9R4AwP8pzcVMdednWuWcD8ycAec8FWnWvjVzlv2fAIAJa5rm0XLnJ3HpcG/a5IzPnwnnBACYmLZtt6YB2l8atsw3D/enSXfWg9N+TgCAiWqa5utl7O6w7RzuT4ucbXc5a5q1O6f5nAAAE9UuPv/r5N9OdXfY7h+UTESuvWv01j/Ir2P/8DNDqXksw4qccdtynRMAYKo0TfPp7q5aHY8M66bB25x1yXOm/qt1Xh5WW+e9XGfn6K3N439jWF8MzrGsMfy3AYD3mTQEj61Zs+ajVV7usD1e10xKu2jzEnHF8DOV8o7OcnftpLVr165rlz7nyuHjMfL5r9U5AMDUS8PzqcQF9VqamhOJ18p8dnb2+syfnpub+0B5R2ZVUx6pcfIO1ng8bpL/Kem5GV9J3Jj4c187Kbnm8fqsZd6fsygvTs+wMuttN97Z76Xuye6c7lYBAGeONC+HE/9KHOlfm5Qm57ulqelid/KLR4vPZSsN0bfLWF5WnvUbSmT+wTR1KRn9PXFt4pnu2vv+9y+9O7nWld1Zy5mOVOvHurWncoarR13zVs6Us12S/FBfm/ye1Mxn7YV+DQDgrJAG5740ag92TVm5w7U9sa3aL03awfKrzYw/TNyeuCv5R+rrLLfRYnO5t5v/IOf9RMans7Z1YWHh/BKlgRst41eiufbRxL7Ec/l3Nw/fHQoAsCzqv22bm5tb1c/TlFxZ56tXr/5QGd/pj/rfCznTx8pXt30+Ho8/3M9zrg3dOPHzdU3r8DVTP6pzAABOozRrDw8btrJW5wAAnEZt2+4oDVvixaZpfjXcBwDg9Cu/SH2oa9pK/Dpr5wyLTkX59W2uc/NwHQCACShNWxq428p8/fr1Vw33e6nbNVzrLfU5AABOQXl8yHCtu8t2Y3mUSMZHMt7d1X42+b7yPLuM9yUOZ+0r3d7G7te413fXeMdmDgCAU5Am6/tprj5X5V+ofola3sxwvEwyvpS9Ld38idHis+We6+rOzd513d5P688BAPAupbH6Q+Kv5S0LGX+S+F2198m2bf/WzY9lWNk9D+7V1H8z44GyNzs7+5kMK7q6nfnMFRn/2F8HAIBlkqbrpsTB8maINGiPZn5vxu9ka8Vo8VEgd6U5u3jTpk3nZf1LyX+W2JO1raX5G14PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACA95H/AGArQwyM3+XrAAAAAElFTkSuQmCC>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAbCAYAAACX6BTbAAABgElEQVR4Xu2UvUvDUBTFi4IuDi4ZCs1HQxAtiC4iojgIbm7+CxU3JzcHRdA/wEEHOyi6Oot0FxcHN4v4AVIcBEE3BdHfxffg5WJJNQ4OPXAgnJNzcnNfm0KhgyxEUTQehuEr/HD4CC/hKazDDVjU2bZBuCbFQRBMWa1SqfSgzcAreB3HceBm2gbhC/jCZbf2yuXyCN473NZeJpIk8WRqeKQ9C7xz+Kz1TBCal3L2v6g9C9Z1Ivf8eDUEd0z5oPYs8Bu/Kid0A++0boFXNGuTtXRpvyVKpVJipt7XngVvtmDKa0qf5bBDV0uBQNUEq9qzwDs290wofdf3/TFXS4Gn70lQ3kB7AiabNsVb2ssEoduwxb5Z1SjeAzwsOLtGjxhqE33ZuT0NzCEz1YGr8xbD5NfQn777eVK8Gn4dclN7Yk5inME3U67ZhOtSoLMCyZtDTg31Z6C4zgPmtJ4blMaU37Oyfq6XtJ8L/EsHZHK44nlen/ZzQ86DD16v1jvo4J/gE6LjatwRKwmcAAAAAElFTkSuQmCC>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAyCAYAAADhjoeLAAAC50lEQVR4Xu3czatNURgH4HuLfORrcgeu83VPm5ti4qaE8j1TUoqJASUxkAETJf+BQiIMhJmUgYGJlJShkWSk5E4MlQET3lX7ZFkdl3IORz1PrfZe73rb6+7Zr73PvmNjAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMA/UFXVslartWVmZmZ+mk9OTi4uewat0+mcLmsAACOr3W4/iPE1jQhO7+L4Msb9sm9YYq+3MS7HeB1BavvExMSSsmfQYq/PcRgv6wAAI6sObGeL2pdGo7Eqrw1SXH9z2jevRWC8nc+HIfZ4XN/v2nINAGBk1QFmQ5/ambw2SHHti2VgS7V83k+3211T1qanp5eWtX46nc6+2ONq2jc9zSvXAQBGUnqKFgHmblmvA9uNsj4oEZiO13vMtlqth+X6XFLoGqtfacb587iH9UVLX7HPsXSs9z1ZrgMAjKT0GjICz+qiPJ5CTax106Tb7S4v1gcm9tgd4e1SHaJ21rU9U1NT7bI3lz4ciP6nZf1novdOdp7u7Vq+DgAwsiK8vC9rEWa2Rv1Rbx7haFu+PgwpRMU+J+rzm81mc2PZk4uele3f/DgifYVaB8J8PCj7AABGTgSkIym8FOV5UfvQm6Se9AQsb8hF7/k5xtGyP4nrHSxr0fsq/WuPWOu0f/HbuVh/0nsN2s5ej/5MBLbD+Tzdc4w3eQ0AYCRFaLmXwktvHllpX4xnUVuZ9eyPcaU3H4QIUNfjmjuy+a4IYFV9fiHWZr93/6iqqolms7muN4/ec3P9fXE/m2IszGvR/ynGx7wGAPDfSsEqxouy/ifSb9TS7+LieCDC1KGx4glZ1PfmcwAA5hBh7VaMk41GY1G5NgzpQ4cIcSvieKpcAwCgv/TF6FRZHKaqqhaUNQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADg7/oGO/CBDpQtUxkAAAAASUVORK5CYII=>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAbCAYAAACeA7ShAAABdUlEQVR4Xu2Uu0sDQRCHLz5QKxury91t7gFaCgciKPgotRILa0VBUtpZCLZWIqKVIGJhp/+AjY2PVhstRLCwUBDBThD91mxkb5KIZ2s++LF785udm0yycZz/R6lUGlRKnaJr9Ije0BO6QefoCM2R2iLPNoQDO+gDjVdjSZJ0BEGwoOOs63b+j9DhJYce2BakR/xKFywWi570anBdt8d0tS89aCX+rP04jn1p1kDitClWruNNGu9QenUhcVsfYC6pHec5UpWPqL+Q0PYaQuKtLsbcVllXtCi0y/qCDnzfd+WZuniel5iuTig2WhXPQ6yddm4URd3EZuxYBgrNm66WpSchZwRtyPg3mHums2Hp5YZCd+iVbZv0bHjprO4K9UnvC23ortCx9GzI6ydnCm2yX8yYeriqcu/0PdTF3oldsE5kEg1hGA6kadpOzj37XunnhheNoTMZ/xOq8kdQRkv8nLqknwuKbDGvtUajyEtB/fZKNWniOJ9bsl1H+dTrXwAAAABJRU5ErkJggg==>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAwCAYAAACsRiaAAAAE2UlEQVR4Xu3cW6jlUxwH8GOMS5H7OMxtn7PPcZtcyiSNSyZD4glJkkhueeBNmIxxyYPUCAmZJ5JEwguZGA/yIim5i8QbmkTz4EF8V+f/N3+rs43OOfs0m8+nfrP+67fW/7/++z8P+9fae5+xMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGjT09MH1TkAgFn1er0PE98mdq5evfq7tNvT9ut5CyHXvWxiYuKFOp/cHVn30cRnOV6/bNmyA+s5Cyn3sSFxVp1fTHmtl6bZq87PR675W+KPJn5MvJd4IHF0PRcAGCEpkCbKG/xYUzyke3z6Pw2jaMt1f5iamjqyyt2ftd4ox829/NwdX2hr167dJ2t8mrikHltsebnX1rn5yuva2haja9as2Tf9rxJf1/MAgBGSouGRpmD7S+nnTf/Jbm6+SvGQtS6o82WtUkR1+lu64/9WXQgO0pvZdbousakeW2y5h18SF9X5uZqenl5W/18WyX1Q5wCAEVLe4BMvt/0UVXfOtWj6J7nmxjpXNOuXAvGVemyQ3OPNOefxtp/jd7vjg+S800ubtdbmnOfr8cWW+3g49/RmnZ+rXO+JAQXbF/1+f3WdBwBGRFMwbUtsSvFwb9rP6zldZSermT8o1tXnFMk/XeeKrPlgxn5v7uP1pPau58wmxcktafYqu0qTk5Mn1+OzyfXfKW3WLB+9vl0NL7rcw8bEx3V+rnKtbxLfVrmjy7PN4ZJuHgAYIXkz35lmaZ0vVq1adVqdm6us81KdS6F1SrdfCouye1aO+/3+wTk+pDte6818F+3FOj+bcq2mKGxjRz1nWMrHwSks96vzuacrmmLqb5rvntWF8F9Rz281r+v6Kvd6d42s+erunisAsAdZuXLlMeUNvc7vxpK84Z+TWD8gZi0Gss7Wbj/zjmp/bNBqCo4Lu7lByvm5/5PS3jT2L35tmes+VvVLcbh/Nzcsgwrfcu+5j1/r/FyV15RnMl3nEo92cwDACMkb+bOJc+t8CqnNvQX+UxAT1S8iy48aSjHR6W9oi40c3524fNfsv8t5b6UIOrHTL9+PG1i0Ze2PyvW7ubJ2W0jl+JMcn532+8y7sdd8TJn2/bIzlvahsmZiR2Jd4oOSKwVn2rsS9+X4vMTVk5OTx6W9qpyf9obSZv3Xdq28S87b2lug79LlOicknm37pZgt99uZsrQ81+Se6+QAgFHW+4eP3uYqhcsd7XGKh/Ob9rLE7WOdgqv8Hbaq2Bia8gvVegcsa2/JvV7cPoNyPymADuuMv9853pa569t+Xsvm0iZ3SK67vDn+sh3vyrm/pcAbr/PDUl7HihUrDq/zAMAIStHR783sNt1aj81HU7gM3AlrZd41Zecp659Zjw3B0rawanf1svaVTdF2T7pLetXHtL3OR4y9Zlcr15jK8RltkVd22/r9/rG5xjm9mZ2029pzWsk9U+eGqTzXUlwu0nMFAIatt8AfiRYTM3+Ud3udn03mTda5YRkfHz+gu9O1fPnyI0pbCtemPbQdm0Up6E5tO+257Vj5p97BK/IsnqpzAAB7hPIdrzr3f1R2u+ocAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADwX/Inppv66AEzQxcAAAAASUVORK5CYII=>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAbCAYAAACEP1QvAAACKElEQVR4Xu2VT0hUURTG38QYJYopDcU4M+/NMDAyEUGzaROKQgsXgoto16Jc1Kp2KelGXBmtape4sCBwpUIk/gkixYUIgVZjSki0qKULF9Uif8fuG67nPRkFd74PPt693/nOOffed9+M40QIgeu6dz3Pa9P6YZBKpZrT6fR18j2mMdHMuDoymUyR5n/hGtNTOn4QCoVCPTmv4Uf4hH6TPD/AdmpOa38oML+EO/AfBW7peBhKpVIN/jk45JjdCjiBLqkDBy17OGjWgnED3jFJn5xD7J68XrxbTogX/Rs779B6ABjHpDHDOAW/ygJIvKl9GviW4bzWBehLyWSyVuv7kM1m8bnrDOMyZ9xjdr+irAHg2YTb1LgSEuvUWgCYnklDS4oz35IFUPSGpQeA55VZqPALHOPWX9a+UFD8AgmrcnFsnaO/Zwq+s3UNXk0jnjfWAnwOaG8AmIZpdF/rxWLxtGt2T7xVxzVyuVwGbzfeKdP8D+Mz2lcBl+E8pk1ppGMCdvXAFHqrY4lEoo54TusC/OOSR/ySjlWAYYjVPdS6D97dWTy/zAKu2jH5HYB9tuZDdPy/OY0GHdsDhnMYytU+BTz9ZhcTSn8On9qaD2rPEBvRegUUe4ThB5ytwkVpLrRvMfMy/JnP5xNW2ZjZ9YKcmqXvQ5zm3/2iR+ALSabBRff/9z0IP5vnADXf8xylcZNueGyQ5vInZMYe49s0fczwmvZGiBAhwsnBLld/pBoB92yDAAAAAElFTkSuQmCC>

[image14]: <data:image/png;base64,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>

[image15]: <data:image/png;base64,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>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAyCAYAAADhjoeLAAADVElEQVR4Xu3cP4hcRRwH8L1DBAUbUZD17V3uODk9FCyUhFSKooWFphIJFomFfxCEgKIE1NLGIlWadIpBwcJO1MpoZWNnFAsrMZ1gF5D4HXhLJpO73RdubyPk84Fh3vzevDdz3Zd5y41GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHDL6Lru/kORy5W+X4qdnZ3bJ5PJY+Px+M4yLvto5yzS+vr66XSrbb227D0BAMyVEHM+7efktK/SX1hbW/u6nXNQst4fWffz9Bez7su5frads0hZ50rWeKmt15a9JwCAmRJG3h01J04JKU/V44OSQHSpGZ+sx/Nk/httbZbM/yR/728ltLX3inKitt89AQAsXALJT21t+ilwiPL5sK0N1QanhKkX6vE8CZbvtLW9dF33QB/WTvbrrrRzyvr73RMAwMIloHxaQkraLwk1j7T3Z0lgequt3Yh+3b/TvhvN+V3Zbm4ksJW/L91t5Toh7NWMf2ymlPft7HdPAAAHYnNzcy0B5VgfVi5P6wk2L9bzpsqpWsLN2dECAk3WOFw+y5a1039Y1Z+4Omt3QwPbeDy+pz0JLOvV49peewIAWLoEns16nIDyRR1kElbO1PenUn8+835P+3ZO+3K0R6ibTCYP1+Oybtpn1fiV+n5fa99/sR5nX4+2zxSpf9TWMv/PtKNN+Zq9tnsCAFi6hJGP63GCzTepneuvT6Q9WN+vbW9v35X737f1IfLcfVnn37qW8T9pD3Vdd0f6t4f8jm7ICVvmfJD3nWrrZf8lkCU4Pl7GZU9Z++56znRPdQ0AYKkSRv7a2tq6tx+uZPxDCUzlpCrXx9K/ds0Djcx5rq0NkeeOl7A0HWedQ2W9/vr1hKhx+T3Z1Sd2NySw5b2X0i6sX386V9qVtPP9vON53/vT5+o9AQDcFOVEqe9LMDmd7kh9P7Un6/EMu37ynCXB6OnSb2xsPJN13mxP0+rgNMuQwDZUv6fVvfYEAPC/k9ByLu1UOXFr7x2w1az7awLke+2NVuYcbmsAALeS6/5P2bLchJAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzwH9HqqpcZO/UgAAAAAElFTkSuQmCC>

[image17]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAyCAYAAADhjoeLAAADFElEQVR4Xu3bMYhcVRQG4GhEjSgmxYKus2+zy8jKqminqSSK2FgoFoq1gliKgiBimsQqRRC00EJIQBGUpIoYEQsxRZp0CoIKKgiCoJ2CxP/CTLgeZ2GU7GYC3weH9865973zpju8mdm1CwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAC4jEaj0W37o51Pj9sp/e5Om8dqHQBgYWRYuW91dfWPxIVJfJ34MnG47t1u6fle4nye6VSODw7D8HHdc6mlz+eJ07UOALBwMrT8nsPuab62tnZPam92W7ZVhrSXc7h6mqf3txnYHuq2XHLpuTd9/kz8WNcAABbKeDxeytDyYa2n9lutbWV9fX3IAPRUrc8rvc6V/Ozy8vINfW1em5ub19baLOlxNPFN4q+6BgCwUIZheCvD1h21nkHmQhvEan2W3ONkrf0X6XWi9Ut81X5XVte3kv3Hu/MDiU/79a20511ZWbkr+z9qfes6AMDCyHA0njWwZKB5NvV3uvzhfr2XtXdr7f9ow2F6Pt6eJwPk9ZPazTl/su7tpf/7idcS++raLOPx+Lp87j3tPNe8PuvzAwAsjAwrz8waWFI73d5Ydfnb/fpUG6za9Ykzc8QT9fomQ9N6n2ffB6nd2c5z/wcSx/r1KvsPJn6p9a1k76uTZ74YdQ8AwMLIsPJd4vu+lgHp3tROTPMMT0eSv9jvqbL+Uq3NK9ce7fP0/6Q7Pzbr69qpXHugvYWbnB9PPF339HKvU6PR6PYuf8TABgAstMkbpou/A8sAcyj5r2XPrYmf+lrVhqyNjY2ban0euffP7Y8Pk/Sq5F+0k8ng+EaOz3Xb/6Ef7uKaNpB1+b/kfp+VvL2dM7ABAFe2DDRnhmF4tNZ7S0tLN9avNueRAeuWyXF/+rySw/39empn+xwAgBkyNP2QQWpvre+E9H4+8UKtAwDQaV+Jtn9W1vpOSO+1WgMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAds7fYHGM2VRfqvAAAAAASUVORK5CYII=>

[image18]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH8AAAAgCAYAAAA7ZacxAAAE/0lEQVR4Xu2Ya4hVVRTH72iRlZGJw8g87r5zG5vsQeGkBEovEAvJIiGiLCl6mIQYaSgimB/6FGqF9iF7oB8q0gjKUnRiMhI1FVEq7fHFnvQhGsGGIYbxtzxr13bNuefeCT16Yf9hcc7+r7XXWWvtx913FwoRERERBedcOzLJ8vWCzs7Oy0ql0kLLR2SgWCxewaB/gmymeIeQ96xNPYD4VyL9vDZYXd6gptuIZVDlBPIbchTZj3Sjf5vnTNsvdxDEBuQDfe8hsGPW5nxHe3t7J7H3SbFbW1vHWn0asLueflMsf6bQ0tLSqoP/Ucg3NjaOlgkgOhba3FCXN0YSRD9BLJEGz1GyE1ij8x3EvJU8ftJiT7T6NGC3DJlv+TMFfN+n8TyTopuputMmRq7o6Oi4SIKgeAusrl7AhL2HHNYib0gutG+zNmnA9ouzPPirNJ4brY56P6J1f8vqcgFBjefj0zXANVI02uW2trbJ8q5FHAF3jdja/mybE+j7HLp5bJ83hDppex9NTU2XdnV1XSh+yuVyMbSTtvAhNxyIX2L4iu+Mwc+LWtD7rZ0FNnN05a2SGIn3FmuTlV8toN9e+v9aGHoGadCJ97utR24guBkEsEMH/zue25HHkU3IP1qctTI71eYB7drA+wtw+2QG6yz+Bm6p9w33Gly/+piP9LhkJexH96EUU5601/HcKt//P4Wg/2L6PyHv+HjWf8/ahXDJdv+l2n7tkry3BCZV86sG8mtS/++EPO07XFKDPci1oS53kNAoDXJ5yBPY88LzXK2HqRMl/RulRe5lsC739uwWV8L185zlOeweVd8fe47V1KHcEfRjlJaV8DPtl71dLcB+PP26C7qyaM8V3zJwxnQIiPM6jWPIRKk1vyxQt4fV/wGXTC4v3yO70XfZPrkjY/CfVP72kC8kB8ReZJPhZVZ/hhz0bXzfqz4e9BxnjEblXvGcgPZh5NOQqwbsN8ggBu27xLfsOqFdGjIGv+b8soDdevEvk92oRsC/ihwnhpuMLl9UG3xZ9SGvK0Ds14e8AG4LMkDCF6vtLLHlG3d6Gz/4dnW6YQ4+8U3VONJks7W3qDT4w8kvC9j9KGJ5gdOTfulc36dIIpps6uDb3+GgOBtDXuCSbW2wubl5nLZ9kjO8jeiUO23waR/im9tCLgOyerr9dzz8/2p87Qz5NNjB59vTyPWq4eRXCXy/pD7etDoB6qc0zjVWlyvkJK6Bpg6+JBLy4AKX3Fb1GL6BPsfgd3giWPn/Dn6Vlb895CqBvkvlNzWF97vYUauzwGai2p4afPou0Thrzq8SivpPAn9PW53GeNAlF1I13UecNQSn0pUhT3uRJnB1yAtI7m50f/Oc7jnaD6n9rYGdP/TM9hzfc8q95LlCcuD7AdkVcKnA/83Y/SlFTNFJYeUq9bjVWbB6LxFb+qyQNu8bfa615lcJxeTqVs4e4V/YkeQ+hf470fXxnBfo8gdBPOaSWT6IDBDQXkmOoN91//3V+yttO5YCiT369zXZb8Wf17vk0sX/1evDZnUp2e7+UE6K8zkyzSV33qc45LApmvc3CdmHDKjdEbkm9XoZxNA3sgtZHPqwKCb3Ar0a/+tGl5lfGiRHbH4JYpCDo8Qhu5qsdDnpr/OTrO5BwmX5rbV8vYD4p0oOlveo9/wiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIuoOJwH7YtGyXcHScwAAAABJRU5ErkJggg==>

[image19]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAAaCAYAAABRqrc5AAABLUlEQVR4Xu2SK08DURCFl1RUQ1vEvre7kiCqUHhU/wKWOv4AgqSpRyEqMGDQGEgQCAoCtQ7SBAUIAihISAj9prls7s6S4Gm/5GTbc2bmzj4c5/+SJMl6FEXfRl/oBd2jHI3QSRiGO57nNXRvBQr3ZVAcx2u2z/+uOSDPsqxuZxUoukFP2hfwL387oITv+0vmtGOdCfhjyanLdFZgrdzTGd6GZNzuQGclKNqTwiAIVn48mhbx+uhZHizWgtVShU1uKX5DZ5bO0SvapaSme0owIDbrHuiMzVIz/EhnJZixKUPkqjMhMm+G72lVZwUUDM0mbZ0JZI+Su67b1NkUwkQK0KHt81G12Gwb/53h12maLtv5FMIOukKfZojojsYLrg/og9+naMv566HOmTM7TADOhVf2in7CbwAAAABJRU5ErkJggg==>

[image20]: <data:image/png;base64,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>

[image21]: <data:image/png;base64,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>

[image22]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAyCAYAAADhjoeLAAADH0lEQVR4Xu3cQYtVZRgHcC2NiEJbDNQ0c+9wGRuYcGGzqEWL1L1SbaJF0EYXbROK7CP0BVqVCqNFkDurnUQuBHUT7SLChbjoG0g9D70HXh9mnGviUfD3g5dzz/O+55znntWfc+fMrl0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwCO0tLT0ykrIz8N2TNPp9OPJZPJirQMAjCpCyfcx/skR4eSv2F6P8V3ko+N17Ziih80YN6KPi7E9Er1dqmsetnZP3qp1AIDRtcB2qq9FUDmfT7j62lgipH0am6eG/ejtj+jnaLfkocse8r7E9mSdAwAYXQtsr5fauzE+6Wvzms1mkwg679f6vOK6V8v+lcXFxef62k4WFhaer7Wwuxa2kkE1rvlruy9f1HkAgFG1cHK21ieTyYdR/6rW5xHH/lBr9yOue66Fpd+jv4N1fh4RGN+I8VO3fyHO90G/ZjvD/Wg9bNZ5AIBRRbj6OkLRgVLeHUHlz5iblXqu/7HWenm+Wvs/8ild9PBOhqYIW8/W+eXl5WO1tpU4/ucYZ2p9O9H/ieFzC2y/9fMAAKOLQHKz1vIP7TOs1Pr6+vozUb9e64MMVi3kZEjaabxXj081JMa6b6P2Wl9rfdzoa9vJgBlrr9X6VqL//bH2dvsOw/i7rgMAGE0ElI8ylJTyngwt9e3I2Wz2atRPx7iTa/q5alpeYLgfceyX/X7/s+Yg+2gvIdyrj6dj3blhJ88T32Ffv6Calp+A45jLW9wfAIDxZKDpA0kElOMtpLzcr0tR21xbW3sh1+/09miGo1xb6/OI899aXV1daLv50+wvdy0IrY9D9+ojevhm2v3NWga8/G79ml5es76JOv3vSaDABgA8/jY2NvZG2Hk7RwSYOzXYVPmGZv1pcx5x/pfadiWu83ls3uzns498Ctb6OLxTHwAAT4wISJ8Nn/MJ2MoD/MuOB5F99C9IPKo+AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB5L/wKC35cDsOJjogAAAABJRU5ErkJggg==>

[image23]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAyCAYAAADhjoeLAAADY0lEQVR4Xu3cT6ilYxwH8DtTJLGhi7n33HPuufdy6/oT3Q2xopQNaTYaSalZYIHFhJlGkbJhYaGQyd9SVliJFKWk2VhobGRjo4hSFpoF3+fe9zRPj4PD4R01n0/9ep7n9zzveZ57Vr/e9z13YQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAOI0Gg8HyapT+pO3T5ubm+dn2wTYPANCb4XD4wGg0+rWLk4kvEh8l7t/e3j6rXd+nnOHNxOcpmN5Je2PO+l675r+WfZ9I/NLmAQB6NR6PL05R9G6dKwVbKeLqXJ9ynkfS7J2Mc5avU7DdVC3pRfb95nR+DwAAO1KQ7G8f+y0vL184T6GytrY2zGfe0eZnlb2PN+NPl5aWzq1zfyVnuKzNFevr6xe1uWly/tuy77F5vgcAgH9FCpIv29x4PB7NU6gMh8O329zfkb3fKPuXsw0Ggyvb+Vml6Lo3zZ7SL4VaPu+TZslUWXcof8PBXP/QPN8DAMDcUozcM60gSe71Op/i5eEUL68mdzRxrNx9qtfXsvaVNvdPlLt02ev2co7sd07Jpb8v/ccTz3ZneTH9q9tra+XuYeKFrL2mnfsjKysrV5Q219wy7fsBAOhNipHXphUkyf2U+L7OpYi5tbTj8fjmadcUpbAqc4kPZoj97fVFCr61epx1byV3+WQ8GAwuTVzQzT2Z+OrU6t/L/L7EiYXqnbg/k72uH536IcZOtGsAAHpTipH2jlhyBxL3Nbk7J/3V3V9tHqjnW5k/1OZmlWufqcfZ7/16nPM+X/U/TgF5VT1fK49BJ49UR7s/pHiuXVPLXo/mM++qxjsFaL0GAKBXXcF2sBvuTf/l0ZQ7VqVISv5o2scSN7TzrVJklf9h1uZnkX2+3djYWOyGe0bNe2cZn+jO8lR5bFrP1cpnZN2HdS7jwwvdO23TZP6HUqRNxl3B9nO9BgDgfylFy8mq/115p62eby0uLp7XPtqcRQqkS7p2NfscSXNtM393XcCNdh9ZXlevAQA4I6X4+mzST4H0Y3mPrJ7vS/Z+KfF0NT6+tbV1dr0GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA4Iz1GwiEo/Ngg0skAAAAAElFTkSuQmCC>

[image24]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAZCAYAAABZ5IzrAAACKklEQVR4Xu2VT0hUURjFRxfWwhYGA9n8eW9wZGI2JS3SViFSLmqn/ZGgVZAQtGnTIkhwJSS4ceFKoSARTc1F+AdaBtq+TRmiK0UoyMCN/U7znnxd57ppRgjmwOHde77vfffce9+9L5GoArLZbBO8bbVisdgQhuGNIAge87xkY1UFAw7CafjV6hgch5fR2+AnTD2z8aqCwa5ZQ8lkspH+Pnp3FH9E/zvN+sOXfEin02d54Y6rx9DS53K568z2CXlX3LjgGhKUj9astrYN7tj4X0ilUmmK3CNpGG7Dt26OoL0ntgqfwz74AS6jn3byjhiyIPYRDrn6ISjQrkGYRQ/Pn+UMaVD0LZ79sVYoFM6g7aI9cHJlaN1qMcLSdk25k/DCZwiz99EP2K6LVkdbgTNWiwx9s5pAjZvEBmjW0e5y42XhM4Q2KkMUDK1O4Vn0HwnzgcoQ+oZJ0/sd8KVikeExG/fCZ4gi85Ghc44+KV13j/pB6YN9DfeIvdDg0dZuKi8m+e9tHS+OMbRYzlA0+AGns9XqFYPPENqCx9CrqhvSd+HqGJnQwJlM5rzVyX0TbcGfLas4ZIjB58rouqNkqMXR38F9mnVWrxgiQ/Ouzgr0yhC8anX6a3DJahVDPp8/RfFfcCXhzFi/DPTP8GmskZ+kv6cL1eb+MyjaGZSuc5nRKohfNHP9GOM8Vu4C2jrPuzrOOnlwxNY6cehOYUVuwYecrJQbr6GGGmr43/EbnoKgcJCu2EgAAAAASUVORK5CYII=>