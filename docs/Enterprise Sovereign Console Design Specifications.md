# **Enterprise Sovereign Console Design Specifications**

## **Production-Grade Custody & Compliance-Gated Staking Interface**

This document specifies the technical design, interface paradigms, typography, palette tokens, and operational workflows for the corporate deployment of the **HashStaking Compliance-Aware Multi-Agent Wallet OS**. It is optimized for institutional treasuries, asset managers, and compliance teams requiring bank-grade security and auditable capital delegation.

## **1\. Palette Tokens & Typography Hierarchy**

The visual identity leverages the **Sovereign Slate** design system, projecting extreme stability, risk control, and high-density legibility.

### **🎨 Color Palette & Semantics**

| Token | CSS Hex | Corporate FinTech Mapping |
| :---- | :---- | :---- |
| Bg-Sovereign | \#0B0F19 | Main interface canvas (Deep Slate) |
| Bg-Card | \#111827 | High-contrast container background (Charcoal) |
| Border-Default | \#1F2937 | Crisp divider lines, subtle structural boundaries |
| SBT-Pass | \#10B981 | Fully certified compliance paths (Active Jade) |
| SBT-Fail | \#EF4444 | Sanctioned, unverified, or blocked boundaries (Crimson) |
| Signing-State | \#F59E0B | Pending multi-sig / HSM authorization (Warm Amber) |
| Text-Header | \#F3F4F6 | Primary corporate headers and numerical values |
| Text-Body | \#9CA3AF | Supporting text, metadata fields, and parameters |

### **🔠 Typography Specs**

* **Primary Sans-Serif Font:** Inter or System Sans (clean, compact metrics designed for dense financial ledgers).  
* **Technical/Code Font:** JetBrains Mono or Fira Code (used exclusively for transaction hashes, EIP-712 schemas, and math parameter states).

## **2\. Layout Grid Architecture**

The console is structured on a high-density, three-pane vertical grid system, maximizing on-screen auditability without vertical scroll exhaustion.

┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐  
│  SOVEREIGN COMPLIANCE PORTAL              Network: \[ HashKey Mainnet (Chain 177\) \]   \[ Operator Mode \] │  
├────────────────────────────────────────────────────────────────────────────────────────────────────────┤  
│  ENTITY: Vanguard Digital Trust II   |  ACTIVE CUSTODY ADDRESS: 0x9A5bC6ef1E7d65B962E338b25B95Fe34Fd15A27B     │  
├──────────────────────────────────────┬──────────────────────────────────┬──────────────────────────────┤  
│  1\. COMPLIANCE & IDENTITY STATUS     │  2\. LIQUIDITY & ALLOCATION       │  3\. RISK & AGENT LIMITS      │  
│                                      │                                  │                              │  
│  \[ SBT CERT CLAIM LEVEL 3 \] 🟢       │  Total Vault TVL:                │  Active Strategy Agent:      │  
│  SBT Registry: 0xSBTAddress...       │  $450,210,489.00 USD             │  Strategy\_Agent\_V4.py        │  
│  Issuer: HashKey Compliance ID       │                                  │                              │  
│  Verified Claims:                    │  Corporate Stake ($S\_i$):        │  AP2 Authorization Bounds:   │  
│  ├─ US Accredited Entity: YES        │  $12,500,000.00 mockUSDT         │  ├─ Max Alloc/Tx: 500k USDT  │  
│  ├─ KYC/AML Expiration: 2027-06-30   │                                  │  ├─ Max Total Slippage: 0.1% │  
│  └─ OFAC Sanction Scan: PASS         │  Accruing Pending Yield ($P\_i$): │  └─ Expiration Epoch: 19827  │  
│                                      │  $ 12,438.5193 mockUSDT  ▲       │                              │  
│  SBT Mapping Status:                 │  (Updated in real-time)          │  Staged AP2 Mandates:        │  
│  Address Whitelisted: TRUE           │                                  │  \- Checkout ID: \#CK-9812     │  
│                                      │  Active APY:                     │  \- Payment Signature: Signed │  
│  \[ DELEGATE REGISTRATION PANEL \]     │  7.24% POS Stable Yield          │                              │  
│                                      │                                  │  \[ INITIATE CUSTODY SIGN \]   │  
├──────────────────────────────────────┴──────────────────────────────────┴──────────────────────────────┤  
│  AUDITABLE OPERATIONAL LEDGER (REASSURANCE MONOSPACE LOGS)                                             │  
│  ┌──────────────────────────────────────────────────────────────────────────────────────────────────┐  │  
│  │ \[Orchestrator\] Core Intent Perceived: Allocate 250,000 USDT to Primary Staking.       │  │  
│  │ \[Compliance\] Executing static contract query: ISBTRegistry(0xSBT).hasValidSBT(0x9A5bC)│  │  
│  │ \[Compliance\] ASSERTION PASSED: Target custody address certified (Verification Tier 3\) │  │  
│  │ \[KMS/CP\] EIP-712 Payment Mandate compiled. Requesting HSM Co-Signing...               │  │  
│  │ \[KMS/CP\] HSM Signature verified. Nonce: 1, Expiration: 1782241600\.                    │  │  
│  │ \[Settlement\] Dispatching dual-signed transaction payload onto HashKey Chain Mainnet.  │  │  
│  │ \[Settlement\] Transaction confirmed at block height 482103\. TxHash: 0x4b7c12...f237efb🟢│  │  
│  └──────────────────────────────────────────────────────────────────────────────────────────────────┘  │  
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘

## **3\. Financial-Grade Staking Mathematics**

The backend uses precise integer-scaled math to execute staking calculations, which is reflected dynamically on the dashboard.

For any certified address ![][image1] deployed in the system:

* **Global Accumulated Reward Per Share (![][image2]):**  
  ![][image3]  
  Where ![][image4] represents newly harvested Proof-of-Stake yields injected into the vault, ![][image5] is the total stake pool, and ![][image6] is our fixed decimal scaling multiplier to completely bypass floating-point arithmetic.  
* **Reward Debt Calibration (![][image7]):**  
  When deposit or unstake actions occur, the user's Reward Debt ![][image7] is instantly updated to lock in past performance records:  
  ![][image8]  
* **Real-time Pending Yield (![][image9]):**  
  The dynamic ticker on the front screen queries this exact equation to increment value:  
  ![][image10]

## **4\. Multi-Sig, Custody & HSM Workflows**

Corporate cash managers do not sign operations directly with browser extensions. The user workflow must adapt to support institutional hardware security modules (HSM) and multi-signature boundaries.

### **🔑 Cryptographic Custody Handoff**

   ┌────────────────────────────────────────────────────────┐  
   │                  Corporate Treasurer                   │  
   │            Drafts Strategy / Intent on UI               │  
   └──────────────────────────┬─────────────────────────────┘  
                              │  
                              ▼  
   ┌────────────────────────────────────────────────────────┐  
   │                 Strategy AI Agent                      │  
   │       Compiles AP2 EIP-712 Staking Mandate             │  
   └──────────────────────────┬─────────────────────────────┘  
                              │  
                              ▼  
   ┌────────────────────────────────────────────────────────┐  
   │             Hardware Security Module (HSM)             │  
   │  Treasurer confirms transaction parameters physically   │  
   └──────────────────────────┬─────────────────────────────┘  
                              │  
                              ▼  
   ┌────────────────────────────────────────────────────────┐  
   │              Merchant Payment Processor                │  
   │    EVM Verifies Signatures and Executes Staking        │  
   └────────────────────────────────────────────────────────┘

1. **AI Strategy Assembly:** The specialized Strategy AI Agent identifies optimal staking rates and builds the EIP-712 payment mandate.  
2. **KMS / HSM Challenge:** Instead of triggering an immediate browser execution pop-up, the system posts the unsigned transaction payload to the corporate Key Management Service (e.g., Fireblocks Co-signer or an enterprise vault).  
3. **Treasurer Physical Confirmation:** The corporate treasurer logs into their hardware terminal, verifies that the destination contract matches the validated ISBTRegistry and CompliantYieldVault.sol addresses, and co-signs the request.  
4. **On-Chain Settlement:** The Payment Processor broadcasts the signed transaction to the HashKey Chain network.

## **5\. Peer-to-Peer Compliance Reporting & Transfer Gates**

Compliance officers require absolute proof that secondary markets are fully ring-fenced. If secondary transfers of the interest-bearing staking receipt token (![][image11]) are attempted:

### **Transfer Gate Enforcement Logic**

function \_beforeTokenTransfer(  
    address from,  
    address to,  
    uint256 amount  
) internal override {  
    super.\_beforeTokenTransfer(from, to, amount);  
      
    // Step 1: Query the on-chain SBT compliance registry  
    require(sbtRegistry.hasValidSBT(to), "Transaction Blocked \- Missing Regulatory Identity SBT");  
      
    // Step 2: Validate that sender's risk limits are uncompromised  
    require(\!riskOracle.isBlacklisted(from), "Transaction Blocked \- Active Sanction Registry Hold");  
}

### **📑 Corporate Exportable Reporting**

To maintain compliance with audit standards (such as SOC2, IFRS, or local tax authorities), the dashboard exposes a **"Generate Compliance Ledger"** action button:

* Generates a crypotographically verified PDF/CSV listing every transaction hash.  
* Appends the exact on-chain SBT certification metadata valid at the precise block timestamp of execution.  
* Displays the signed AP2 Payment Receipt validating the legitimacy of the autonomous AI allocation.

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAcAAAAbCAYAAACwRpUzAAAAsklEQVR4XmNgoAtgVFBQiFRUVBRHl2CQl5dPAeL/QAWJ6HIMMjIyqnJycmHo4viBkpKSGggDmYwoEkB7moF4FhA/BdrXCJcAcgyAgt1QRdeBeDGyrmSg09WBiixALpWVlfWDSyIpmgLEn4GKOFAkQAJAiddAvARFAgSAfguBet5dWlpaBsivg0uCHATET4BMZiDdA3SDPlwSqMMDKPgCSE8E6qqHSyApEAAGghy6+CjABwAFZSOAHqJkDwAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAcCAYAAAC+lOV/AAABEUlEQVR4XmNgGNRAXV2dV0FBoQBdnCggLy/fBMQ/gUxGdDm8QFFRUR2o8TsQ/5eRkRFCl8cL5OTkdgA1PgZpBmJNdHmcAOhPf6CGqUA8F6QZyHdAV4MVGBsbswI1nAZqEADa3gbSDKTD0NVhBUDFpUDFqSA20IBCqLOz0NVhAKBiCaDCvQzQ0AXy46HObkRTigmAChfJysrqIPE9oc6ejqwOAwAVWEOdiA2vRVePDJiACvZKSUmJIAtKS0vLgDQDnX0IWRwFACUrgTbHYhHngNp8E10ODsjWDFRgAZR8B1KIRQ6k+SsQf0KRAAoYAfEZIP4LNf2GqKgoD0weqLEBKPYKKgfCx4C4FNmMUTAKBiEAAG2AS/nQbI4oAAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,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>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAbCAYAAADyBeakAAACLUlEQVR4Xu2UT0hUURTGxxr7B4FBmAwz82acgakBC5pFy2rjrpVku6AS0Y2pmzaCCwXBlRFB0KrcBUWE2EIoWmSLSIKMtJIiQvAPhIIrF/Y7dK5z58xrnJWr98HHvPd93z3n3DvvvVgsQh0IguBWJpO5ZPV9QzqdLjLENpzn9oD1w8CaYfI7HjfgEnwPn7GhG4lE4phd91+waBJuSTEWX7N+LZD/yrrNQqFw3GmpVCqB9hGuM2zJz4eCIqcJf4M3dUefY3WeRjabPaWDv7Aeepd4DPHAelUg+FgG4DKuu5KFV20uDGQ7dIgB67m/C2/CehVgJ+SCRS7jcu+mhx9MNBQ0uCt56pyzHvocXMvlcs3WqwChe9LYk+Lc/9TC7Z4eCnJf4IqvMVgL2n04S42C71VB/89PpVKp0dcp0qOn8crXLTjuVs39gTPwHVwVjRq9MT3dmiA8ruEKFIvFQ4GeBv5F6zsE5Qd50GnkjzDcG7Qpbhu8eDV4f08S/C4NrSeg0G1t8NJ6DjR8JBlO9Kyvo43oBi74ehUIjRLqt7pDMpk8SmZFBzlvfQH6D7gcoj/VdZettwuaNxFY2OtrRmZIinEqz0M8ea2k0RNjNaCtqXfGeGVQ9A6B38G/h6kW32qxHU6mzdToVm/3eRDk8/nDbg3MisbvtJ8RxCnwywvWy4eymLXXuZ73dPnUv0Y/4RrIF1I8fvvgGOwst98/HKTxFQYZ3PM7ESFChAgRauAvlJ+3ZVqJ1JIAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAbCAYAAADlJ3ZtAAACr0lEQVR4Xu2WO2hUQRSG140vRHwEV2Vfd19FXAQ1iygqmqdgo4VvMFqkCD5A0EIlURALsYnGRhERQW0sxC7BQgOxMoKVBLEIKIIoSKxF9Du5M2b25C4SErxB7g+HmfOff2b+nZm798ZiEf4xSqXSkmw2u9XzvDWVSmWecMVicWUymVyktaEil8udx+QocRPD92lH4JpohxOJxGKtDw0YuoLBAXcHMZqDHyNeuNpQgZktxC+8Neia7DD8Zc2HBoz2ill7R3UNw62aDw0YuidmiU5dw2h70I8IDRxzlzEr8QmDTzOZzG6tmy2IY/gaRn86piX6qdVp8awAO7qcaMN4H0Z/GMMtWjfTYM2jrDNE7NW1KuTz+XWaEzDwpJjF+HGHayR/5upqYSpaEEf/DS+eLvwBk62W/1bNC8xbTHZ2l+Xon4W/5epqYSpano+N6Ec1XwXMHiReaV7A4G7irfwTpNPpFP2LxGt5+Bhz2Oro74C77flvvQN/0TbAXaXWyS7utLz8MOKOzQNhFpHda1Z8K9xHFi45tBzVGG+4FY5uP9xLTCyTnP57M2aSlrzFmF9Iu0/md2pP4I7YPBCIhoke4h3i656/Iw+IQY5mrdI2EiMOVUf+lXFtjmZITitAO9essU0SNMfIH5ra+H1NpVJpRz8ZDG6XtlAoLJVfS5xjokNQc5RUtKeZ9K7NOcbt5F/oxiUvl8vzyb+jK9fQfo6ZeaVGnJA+662n/8ZqZwRM+Fh2RL6+aLuITe4iGOyA6wvSkjcTg1LjE3QB2g9ikrgAf4r2hpjnCtXb+aYFz/9+OGMmH7+jLDpA3k17SU4lNrFzVVp5SOn3Z/07/oh4TvRQ20zs8fyr11u14HRgjnmDy8kusViTNW8RpI35dzxv63zQZ2yBa7JqQhYhQoQI/wV+A7kBuIjmlBYeAAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACQAAAAZCAYAAABZ5IzrAAACKklEQVR4Xu2VT0hUURjFRxfWwhYGA9n8eW9wZGI2JS3SViFSLmqn/ZGgVZAQtGnTIkhwJSS4ceFKoSARTc1F+AdaBtq+TRmiK0UoyMCN/U7znnxd57ppRgjmwOHde77vfffce9+9L5GoArLZbBO8bbVisdgQhuGNIAge87xkY1UFAw7CafjV6hgch5fR2+AnTD2z8aqCwa5ZQ8lkspH+Pnp3FH9E/zvN+sOXfEin02d54Y6rx9DS53K568z2CXlX3LjgGhKUj9astrYN7tj4X0ilUmmK3CNpGG7Dt26OoL0ntgqfwz74AS6jn3byjhiyIPYRDrn6ISjQrkGYRQ/Pn+UMaVD0LZ79sVYoFM6g7aI9cHJlaN1qMcLSdk25k/DCZwiz99EP2K6LVkdbgTNWiwx9s5pAjZvEBmjW0e5y42XhM4Q2KkMUDK1O4Vn0HwnzgcoQ+oZJ0/sd8KVikeExG/fCZ4gi85Ghc44+KV13j/pB6YN9DfeIvdDg0dZuKi8m+e9tHS+OMbRYzlA0+AGns9XqFYPPENqCx9CrqhvSd+HqGJnQwJlM5rzVyX0TbcGfLas4ZIjB58rouqNkqMXR38F9mnVWrxgiQ/Ouzgr0yhC8anX6a3DJahVDPp8/RfFfcCXhzFi/DPTP8GmskZ+kv6cL1eb+MyjaGZSuc5nRKohfNHP9GOM8Vu4C2jrPuzrOOnlwxNY6cehOYUVuwYecrJQbr6GGGmr43/EbnoKgcJCu2EgAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABcAAAAbCAYAAACX6BTbAAABgElEQVR4Xu2UvUvDUBTFi4IuDi4ZCs1HQxAtiC4iojgIbm7+CxU3JzcHRdA/wEEHOyi6Oot0FxcHN4v4AVIcBEE3BdHfxffg5WJJNQ4OPXAgnJNzcnNfm0KhgyxEUTQehuEr/HD4CC/hKazDDVjU2bZBuCbFQRBMWa1SqfSgzcAreB3HceBm2gbhC/jCZbf2yuXyCN473NZeJpIk8WRqeKQ9C7xz+Kz1TBCal3L2v6g9C9Z1Ivf8eDUEd0z5oPYs8Bu/Kid0A++0boFXNGuTtXRpvyVKpVJipt7XngVvtmDKa0qf5bBDV0uBQNUEq9qzwDs290wofdf3/TFXS4Gn70lQ3kB7AiabNsVb2ssEoduwxb5Z1SjeAzwsOLtGjxhqE33ZuT0NzCEz1YGr8xbD5NfQn777eVK8Gn4dclN7Yk5inME3U67ZhOtSoLMCyZtDTg31Z6C4zgPmtJ4blMaU37Oyfq6XtJ8L/EsHZHK44nlen/ZzQ86DD16v1jvo4J/gE6LjatwRKwmcAAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAA7CAYAAADGgdZDAAAEMUlEQVR4Xu3dO4gdVRgH8DUaTYzgA5cr171zZy6r4moRXZ8oGPANCgqpFCFG8QEWFoIGiVoLFmKlqRQRxEJLMRYqFoISCysLsUnEYGMIGrCJ3zEzydmTiWz0ZrNkfz84zDnf+ebOLf/cx8zMDAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwH+0sLBw7mg0umE4HJ6f1nNzc5eXPdNW1/VDZQ0AgB7j8fj+yWRSpXkEtY1VVX05GAw2lX3TFGFtW1z3u7IOAEAhfaIWwWl/Xov19nw9bRHWLoprfB9jb7kHAEAhwtPjEZwOLy4uru9qo9Ho2rynT5xz/WQyubBbx+tsiNrHec+JRN/u9ni4aZpBuQ8AQKaqqoUUnGL8HuPzKK0re04kQtpnXWiL+Ydx/iNlT58uEKbrLiccAgAw80/gujnGSylExfG1VIswd3fTNOOidYnouT3Oea+s95mfnz8ver/o1m1QXFbIAwBYy5Z8otaGqA/a+a7RaHRjvt/jnOjbUxb7RN/O9vWPjgiHz5d9AAC0IixdNjc3d0leixB1MMbVsVfH8YV8rxT774/bT8jyr0dPJK51Rb5uQ9uuvAYAQCbC0qNVVb3SrduQ9nCaR/3VmO871n2cdV1YS6L/zjj9q7whF73P9dQOx3mflHUAgFUl3bC2/aQpjQMxfoqxO8Y7Ze+0RVi6Kw7rmqa5JwWq7qa52f4D+RoAYM2KsPRWCmx5rT5ym4wf8tpKmkwmV8b1X56dnb2g3AMAWHMiGO2J8VtPfUmIW2npX51lDQBgTUrBrKqqp/rqZQ0AgNMgBbP0FWRfvayV6rp+t/3NW++I/afLcwAAOAntb8WOu/FsBK0dVVW92K2j54l8//9KYXA1jfL9AQCsGhFWtqeR14bD4aVR+6X812afCHabY2z5l1GX5wAAsHxnRzD7uVvMz8/PxvrJyFhvdj/4j/mzo9FomJ75eew0AABOuXS7jPGRB67nXw0eGhd3/o+gdlvTNFfNnMRD2U+XeK+Tbp7uLxdh894Ym/MeAIAzUXqiwI8RfHaUGyuhfHRVEsHs4hiP5QEtife5M5v/Fe/5vhjPxPxA3gcAcMaJ0LSxrJ1qEbRuiUC2NcLWH3k91tdF/Zq25470yWC2dzSwZbVvYrxe1gEAmJIysEVIe7ubLy4url9GYPsoztlQ1gEAmJIysMX6YLHen83zr0RvjfFGhLUt4xV4LioAwJrVE9iW3DMt1vva484YX6djhLQ6jntTbxpVVX2anwMAwBT1BLajtyFp17/mawAAVlhPYPu2WP+ZrwEAWEHp5r0RyA7F9Kyulv4h2jTNTe38wTLQAQCwCqQnL9R1vW0wGGwq9wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADOVH8DWpz4UAe1CtYAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAbCAYAAACeA7ShAAABdUlEQVR4Xu2Uu0sDQRCHLz5QKxury91t7gFaCgciKPgotRILa0VBUtpZCLZWIqKVIGJhp/+AjY2PVhstRLCwUBDBThD91mxkb5KIZ2s++LF785udm0yycZz/R6lUGlRKnaJr9Ije0BO6QefoCM2R2iLPNoQDO+gDjVdjSZJ0BEGwoOOs63b+j9DhJYce2BakR/xKFywWi570anBdt8d0tS89aCX+rP04jn1p1kDitClWruNNGu9QenUhcVsfYC6pHec5UpWPqL+Q0PYaQuKtLsbcVllXtCi0y/qCDnzfd+WZuniel5iuTig2WhXPQ6yddm4URd3EZuxYBgrNm66WpSchZwRtyPg3mHums2Hp5YZCd+iVbZv0bHjprO4K9UnvC23ortCx9GzI6ydnCm2yX8yYeriqcu/0PdTF3oldsE5kEg1hGA6kadpOzj37XunnhheNoTMZ/xOq8kdQRkv8nLqknwuKbDGvtUajyEtB/fZKNWniOJ9bsl1H+dTrXwAAAABJRU5ErkJggg==>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAA7CAYAAADGgdZDAAAEr0lEQVR4Xu3dSYhcRRgH8IlE9CCoSJSYmenuyYB6UNG4EAOiiZ4Uby4ng3GJS1BBUVASVMhJCIjGBcGFKIKgxJOCqBcF8SAIInoTFxQEN/DkIf7LeS+UZY9OwiSTIb8ffLyqr6rzOn360/3mvYkJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADgqDY9Pb1hMBicVcZr1649tV1fbDnf1TnfeW0fAIAxEp7e6ccJUb+mPqjXD4WcY19qV9sHAKCR0HTJcDg8s58nvL2U+aP1nsWWc67vAtsr7RoAAI2EphdSN/fzBLYr161bd2y9p1X2p55seqM4o+6Nk31bUtu7wPZZuw4AQGM4HG4t4SlBbe/U1NQ17fp88ro7clhRxuWat/wbHzZbxsq+j/La43P8JfVDuw4AwBgJaycnRD2RAPVnamPVv7He18pr7k09N1jgHw/U38CVgFeCYr0OAEAjAercep4AdVf3zdnEzMzMiRm/Va+3sn916osMj2nXxsne90tIq6vdAwBAJYHsk3qeAPVwf/1axrvKrTfq9Vr5GXRycvLsMi5BL7W73VPL+nuzs7PHVfOdAhsAwP/ovuW6vIwTzjZl/G23tDLz6zJ/tdq+X4LXqhLA6l7mD01017SNsbL9y9P8+zsENgBgWUmAeSYB5uvUHxl/k+Nng7lvuWbavYup/PSZczw40YStnPvnNWvWnFL3loMEw4u7IFrqp9SXqXdTO9u9AAAHrAsZd/bzhI8bSq/ec7jkvHsS5O5u+8tBF3Z/r3vler30nq57AAAHrISzYXUT28zvW8LANmp7y0UXfN8Y0/+t7QEALNjU1NTpCRRvVq1juuDh8U0HqA2+dX9mZma67QMALEgCxk2DuWuttpcL9HP8PMfN7b7a9PT0Fd1rxtaqVatOaF9zNMj//esxvXILkvIN24JuQQIA8C8JE9/lsLLtF+V+aKmT2v7BKt80HUnVvr/eYEwI7avd28vaLaXG9N9Ora/mz9frAAD/67+Cy3xKiEtdNl+1+48G5eH1k5OTs3VvNBpdejCfLwDAP8wTKMr90Mr9ysbeD41/qz/HcmPfBNdHUlubPeXn0e/rHgDAvBLIni3hoQSN1Gv1Wvc0gdnsua3uH6FW5P2f308Skq5P3VRvOJTyGW3I+T/uPse+yuf62Ji9t6a/p+0DAByUhJ7N5efNEkjatcOh/PVq20vY2Zb3c+2Y/pbueNVoNDqtjLNv7z93Lb28v2+Hi3hNIADAkkiouT+1O4Htgr6X8HVPeQpDteerftzN/w5svRLaSnire0eCvKfV9XNNAQCWrYSzB+rANph7zNPr1Xxf9qyr5jf344m5n0j97AgAcCiNCWz7Uk818/039i3XhvXj4XB4e/kpN+uP9z0AABbZQgJbQtnLo9HonIy3D+budVaO67u9pR7q9wMAsMi6wHZhP+8C2P4HqHdzj84CAFgqJbCNRqOL+nkJaOm9WM99gwYAsIQSznakNvXzhLMtqR+r+ac5rOjnAAAcIRLUtqU2tn0AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAxvsLkhsuz//Q6sQAAAAASUVORK5CYII=>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAAAbCAYAAAAqCUKuAAAEMUlEQVR4Xu2WW2hdRRSGd4yXeK23kJDbnByjJ4mCkYgVvBURQRTE9kE0+mBMvEBRCcGioEgrYqWKQmIVK2giRo1NpIoaWvXBh1aMCkYxPhgFLd5CEg340DzU78+eictJczz6oEH2D4s9869/rT0ze2bNTpIMGTL8G3DOdWK7S7GGhoYxQg6PcxQDcZ9hB2X19fVnxf5VCQb7EfZiY2PjxTU1Nac2NTUdRf9HbKZQKBxfV1d3NItxYS6Xex5uMo4vBcQNYNM0D4t9qw4sxNkM9p3EDJbJ5/yXHTXSRF+ZxXnNcqWCXFNxvlUL5v8wE73Kci49TlqUXsujXQf3iOVKAYt5mvLxnk2x7z8BW7+JwbTSLAucBllZWXmc2gx2WxLVCLhBTQLduRF/KXaF5QLYcU6LRkxN7AuLrCMYOMZ1smKszkK7kphzaJZbnpjzeE+F6bu/VadI+ijWj00xoPvF8cz7XfBWrA/A9xM2l5iFXAkMcK2KL3YHdgP9T4m9z2rgn4P7tb29/Qh9DO1O+vdiP0cLUw7Xhb2B5i6XLuY+1Tg5aT/p477FrsFGsG3+OZnP588wuZZDXxnhgNo8P8cG1fZFdB/27p8jUmhXuXTRRmJfDDTrsQO86yLDdSiePGca7mvsdf9BhphwNc83vS4fdLm0kH/C5NaY2PdYuIKfTw877HQ/vi+IPUkaXQbitJAh7pBAdLMGZpJ0BB/B19Hvt/oAfLf6wd4Z+yxqa2vr0E1jz1qe+DYff4v6oZ5gO6TVBMQz0cvR3h7i0N/odYvHE18FXDfPJ9SH76TdjF3r818QYuk3isN3W+CKAvGD2G+hhggE36TkVheAdqdeoFsp9lmg2ewHconlzaC71TeT/dKltWqD1QfAf4j94v74J9IVfmWsI//T8DOJuS2dr1mqn0a6MhBPYMMR9wrH6ATLeZThm8NmY0cMP4n5ZHmRVg3TohZ8v085pXNpoT6IddkYr1toKOG6d+lR3Gk54t6GG7fciqiqqjrWD2LpatW2J8lTVhfgz630r8a+GGj2kucDy/GlauFn+Zq7jO5jZ/5PXHrk+tQmfru5Bb/Cngm6AH/cFm8g7QQ/vp7g5105cTzukY72C8G3IhD9QMADvluuBQkFKgb83eYFRYGuF/u+tbX1SPX5Ez6G/h5sSgsvTteu8imvD9NOnFefd5yIvRzy0d6Kb2/oe04THg43lPPHxP4q0L9eHNYif6hlRUHeqxF/w/Nxl9YX3f1LIMllcO9jMz65bAGbwPeS1VroekUz5NKbbYvPMch7qoNGxdTnagmcS6/VcWwUbVvg9aGwMfgdPB/y492YM/8k9B/DvkuW/33v93Hbra8odA3/VeH8p2BXnKIvZwdvUBZqi0E52nW6FSN+EUwsj7855gWVg0P5tFvhz4/5DBkyZMiQIUOGDBn+X/gdmiQ5ZHVYD3gAAAAASUVORK5CYII=>