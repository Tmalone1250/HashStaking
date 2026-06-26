# **Master Specification: HashStaking Console**

### **Institutional Permissioned Yield & Liquid Staking Settlement Engine**

**Blockchain Network:** HashKey Chain Mainnet (Chain ID 177\)

**Track Alignment:** DeFi Track (RWA, Compliance, Native Staking Yield & HSP Settlement)

**Budget Constraint:** $0.00 Solo Builder Framework (Model-Agnostic Local Llama3 Core)

## **1\. Executive Vision & Pitch (The VC Alarm Framework)**

### **The Problem**

Traditional institutions hold over $100 Trillion in global assets but are legally barred from participating in native Web3 staking yields due to **regulatory non-compliance** and **counterparty risk**. Staking into anonymous public pools exposes institutional asset managers to severe anti-money laundering (AML) and sanctions liabilities. Additionally, locking assets in native validation nodes restricts liquidity velocity, forcing capital into capital-inefficient unbonding pools.

### **The Solution**

**HashStaking Console** is an institutional-grade, zero-liability gateway deployed on HashKey Chain Mainnet. It wraps liquid staking positions into standard, permissioned token models that can only be minted, transferred, or traded by pre-verified, KYC-compliant entities. By maintaining a strict 1:1 asset peg and utilizing a programmatic reward debt accounting loop, HashStaking Console automates compliant yields directly to corporate treasuries via the **HashKey Settlement Protocol (HSP)**, completely bypassing traditional back-office administrative overhead.

### **The Venture Capital (VC) Thesis**

* **Zero Principal Risk:** The protocol provides $0.00 of the underlying principal. Investors supply the capital; our smart contracts act as a secure, compliant software transaction gateway.  
* **Asymmetrical Scalability:** Software leverage scales infinitely. Operating costs remain completely flat while protocol revenue grows linearly with Total Value Locked (TVL).  
* **Frictionless Capital Velocity:** Verified corporate users can exit staking positions instantly prior to maturity by trading their yield-bearing shares on the built-in ERC-3643 compliant secondary market, avoiding blockchain-level unbonding periods.  
* **Low-Fee Competitive Under-cut:** While retail protocols extract a 10% performance fee, HashStaking Console operates with institutional efficiency, offering customizable corporate tiers (e.g., a flat 3.0% yield fee) to attract massive yield-sensitive fund allocations.

## **2\. Core Protocol Mechanics & Accounting (Model B)**

### **The Staking Peg**

To eliminate structural tracking complexities for institutional audits, the protocol issues wrapper tokens (e.g., hskETH, hskUSD) pegged strictly at a ![][image1] ratio with the deposited underlying asset. Staking yield is handled as a separate, active distribution asset rather than mutating the underlying token exchange rate.

### **Gas-Efficient Yield Distribution Math**

To prevent gas-intensive looping transactions across thousands of corporate holders, the platform implements a scalable, mathematically secure **Reward Debt** state pattern.

1. **Global Reward Indexing:**  
   When the underlying staking validators harvest reward emissions (![][image2]) on HashKey Chain, they sweep them into the Staking Vault. The contract instantly increments the rolling global index of cumulative rewards earned per individual share:  
   ![][image3]  
   Where ![][image4] is the total circulating supply of the vault's wrapper tokens.  
2. **The Reward Debt Baseline:**  
   Whenever a corporate entity interacts with the vault (deposits, withdraws, or processes a secondary transfer), the contract records their balance and captures a personal reward debt baseline:  
   ![][image5]  
   Where ![][image6] is the user's current token balance, and ![][image7] is their reward debt offset.  
3. **Programmatic Yield Entitlement Calculation:**  
   The contract tracks exactly how much yield (![][image8]) an individual user has accumulated since their last transaction using the following offset formula:  
   ![][image9]

When yield is programmatically distributed, the protocol subtracts the protocol's customizable administrative performance fee (![][image10]):

![][image11]![][image12]This math guarantees that a user can transfer, buy, or trade permissioned tokens at any block interval without losing accrued yield or stealing yield from prior epochs, running entirely within ![][image13] constant time complexity to minimize gas costs on HashKey Chain Mainnet.

## **3\. Regulatory Compliance: ERC-3643 Integration**

To enforce institutional-grade compliance at the token layer, HashStaking Console integrates the **ERC-3643 standard** (formerly T-REX: Token for Regulated EXchanges).

                                 \[On-Chain Identity Check\]  
                                             │  
                                     (Queries Claims)  
                                             ▼  
 \[Institutional Buyer Wallet\] ───► \[IdentityRegistry\] ◄─── \[Institutional Seller Wallet\]  
             │                                                 │  
             │            (Valid KYC claims checked on-chain)  │  
             └───────────────────► \[ERC-3643 Token\] ◄──────────┘  
                                             │  
                                   (Executes Transfer)

### **The Compliance State Pillars**

1. **On-Chain Identity Registry (ONCHAINID):** Users must resolve their wallet address to a decentralized, sovereign on-chain identity contract. The identity registry tracks administrative claims (KYC/AML status, accredited investor credentials, regional legal jurisdictions).  
2. **Transfer Restrictions:** The ERC-3643 token overrides standard transfer hooks:

function transfer(address to, uint256 amount) public override returns (bool) {  
    require(identityRegistry.isVerified(msg.sender, to), "ERC3643: Transfer restricted by compliance gate");  
    \_updatePosition(msg.sender); // Processes Model B yield math before balance shifts  
    \_updatePosition(to);         // Anchors reward debt index for the recipient  
    return super.transfer(to, amount);  
}

If a corporate entity's KYC credentials expire or are flagged by legal authorities, their identity claim is revoked in the registry, instantly freezing their ability to dump staking assets on the secondary market.

## **4\. HashKey Settlement Protocol (HSP) Integration**

The **HashKey Settlement Protocol (HSP)**, which implements Google's open-source **Agent Payments (AP2)** specification, is utilized to transition secondary yield payouts into fully automated, programmatic execution loops.

### **The AP2 Cryptographic Flow**

1. **Mandate Formulation:** A lightweight off-chain service formats an EIP-712 Agent Payment Mandate indicating the calculated net yield (![][image14]) is ready to be transferred to the corporate client's whitelisted wallet.  
2. **The Automation Agent Loop:** The off-chain worker formats the checkout request, verifying that the on-chain claim registry permits transaction routing to the user wallet.  
3. **Execution & Settlement:** The vault contract executes the payout using native gas tokens (HSK) or wrapped stablecoins (USDT/USDC). It broadcasts a cryptographic verification receipt proving the transaction satisfied on-chain legal policies.

This active distribution approach replaces human-driven manual settlement loops (e.g., back-office wire prep) with high-efficiency machine-to-machine payroll processing, ensuring absolute accuracy and zero human oversight error.

## **5\. Technical Stack & Architecture ($0.00 Solo Budget)**

To guarantee high execution speed and maximum local defense against dependency failures, the console is designed around a fully containerized, localized runtime stack requiring $0.00 of cloud provider expenses during development.

* **Frontend Dashboard:** Next.js 14 / Tailwind CSS designed on an "Executive Calm" framework using glassmorphism layouts, muted borders, and live telemetry log consoles.  
* **On-Chain Operations:** Viem & Ethers.js explicitly configured to compile and read Mainnet Chain 177 RPC pathways.  
* **Web3 APIs:** Mainnet block explorers and RPC endpoints.  
* **Headless Backend:** FastAPI (Python 3.11) with a Server-Sent Events (SSE) log stream mapping backend worker loops to the dashboard in real-time.  
* **Off-Chain AI Adapter:** A decoupled model provider adapter dynamically switching from local, offline llama3 processing (Ollama) to online production LLM providers via standard environment toggles.

## **6\. Sprints Plan: SDLC Trello Board**

Use the following cards to populate your SDLC sprint columns. Every card is structured around concrete, measurable terminal and smart contract deliverables.

### **Sprint 1: Setup & Compliance Infrastructure (Foundations)**

* **Card 1.1: Local Repository Scaffolding & Adapter Build**  
  * *Description:* Initialize local directories, populate requirements, and code the model-agnostic llm\_adapter.py wrapper bridging Ollama / LLM APIs.  
  * *Checklist:*  
    * \[ \] Run mkdir hashstaking-console && cd hashstaking-console  
    * \[ \] Configure .env.example mapping out LLM\_PROVIDER=OLLAMA and local RPC nodes.  
    * \[ \] Implement unified JSON validation schemas to parse investor intents without halluncination risk.  
* **Card 1.2: Deploy ERC-3643 Permissioned Token Contract**  
  * *Description:* Code and deploy the base permissioned token standard over HashKey Chain, integrating custom transfer hooks.  
  * *Checklist:*  
    * \[ \] Build mock IdentityRegistry.sol containing jurisdiction check logic.  
    * \[ \] Code compliance transfer restrictions to revert transactions if wallets lack claim stamps.  
    * \[ \] Compile and verify contracts on HashKey Chain Mainnet Explorer.

### **Sprint 2: Staking Mathematics & HSP Integration (Hot Path)**

* **Card 2.1: Implement Staking Vault & Reward Debt Pattern**  
  * *Description:* Develop the Model B staking vault mathematical tracking functions using Solidity custom mappings to handle scale without iterating.  
  * *Checklist:*  
    * \[ \] Implement state tracking structs for UserPosition (storing token balances and reward offsets).  
    * \[ \] Code global multiplier indices checking incoming yield deposits.  
    * \[ \] Verify constant-time math correctness under mock high-frequency trade transactions.  
* **Card 2.2: Implement HSP EIP-712 Settlement Scripts**  
  * *Description:* Code the off-chain settlement scripts compiling AP2 cryptographic mandate payloads for yield distributions.  
  * *Checklist:*  
    * \[ \] Implement standard EIP-712 typing for the Agent Payment mandate schemas.  
    * \[ \] Build an automated off-chain keeper checking when current indices exceed payment thresholds.  
    * \[ \] Execute signature verification loops confirming payout destinations match legal identity claims.

### **Sprint 3: The Executive Dashboard (UI Prototype)**

* Card 3.1: Build Next.js Dashboard & **Preset Matrix**  
  * *Description:* Code the client-side dashboard with dark glassmorphism styling and zero-typing corporate demonstration selectors.  
  * *Checklist:*  
    * \[ \] Design the executive layout centering the live status logging console.  
    * \[ \] Scaffold preset selectors (e.g., "Yield Stream: 5.4% ETH Node", "Verify Institutional KYC Claim").  
    * \[ \] Integrate viem configurations mapping contract interactions directly to MetaMask popups on Chain ID 177\.  
* **Card 3.2: Connect FastAPI SSE Streaming Logger**  
  * *Description:* Build the async backend pipelines streaming real-time operational states straight to the operator dashboard.  
  * *Checklist:*  
    * \[ \] Implement FastAPI async endpoints generating Server-Sent Events (SSE).  
    * \[ \] Stream progress trackers detailing compliance status and calculated reward debt offsets in real-time.  
    * \[ \] Execute complete local

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAZCAYAAABdEVzWAAABPklEQVR4Xu2TvUrEQBSF12KxsZCFVIlJIGkFIY3YqS8gIsjWPoDiTyNY2GyxhWBnY+UD+NOKvYWtpU9gYSViseg3EGFy2IkgSQqZDw5D7j0z92RCej3PfyWKokGapttabxpmLCVJsqL1CmEYRhiHGM/QK7pWTxPw0oucvYOu0CfaV08FQi1jOonjeIv1va1g5ktw9jFzdlm/fg1m02awH8qLaD8Yg+a1VkcnwfCO0Rva1J6LToIx5Bz/hHVDey46CWbIsmxBa3X8ORh/zY3Wm8QKdqA9JyYYG2+13iRWsEPtOSmD3WndRVEUfW640HodVrAj7U0lz/NZzB/ogccZ7U8D76UZwrCh9lzgXy33nGqvAqY19FiGMm9i9ILugyCYU78NtzXCN2Fd155CkD28z8ZvzXli74V6PR6Px9MS328FYWSimcpsAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAbCAYAAAB1NA+iAAABRUlEQVR4XmNgGF5AXl7eCYj/I+HvQPwYiC8oKCjskpOTK5ORkZFG14cBgBrmgAwAanCGiQE1cgLFFgHxLyBOQVaPAYAKLgLxeyCTBVlcSUlJDeqya8jiKEBFRUUUqmgdupw8wovn0OXgAOjsEKjzc7HI9UMNcEKXgwOgoukgRUA/68LE1NXVeYGBmA4Uvw+k/ZHVYwCgortQW/YC8QGggY+gLpoONFQIXT0KACpQgWpejywO5PcB8R2g7RLI4hgAqCgZakAOsjjQdleoeCmyOAYAKlwAUigrK6uDLA60uQDqjTpkcQwgD/H/SyCTEU18DcgAUEAii6MAoKQG1Jko/gcBoM0HoQYkgPhAeiJQTAksqaioqA+UPCEPSaIgA/4C8XEgdoQZAGRHQ+XmADXHA+k+mBzRAKjJChoWIINRvDgKRsHAAwCm/V3dfqp0HwAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAA9CAYAAAAQ2DVeAAAFmklEQVR4Xu3dX4hmZR0H8NldS9MkFbeR2dn3nPmTi5uauqS5FCyrUBB0oUmXxioigmJKhIJgelEgWV4IYij5h4IFL3bdRSMNK1GiqKSL7nRBZP2ziHqheBHb7zfznPbZR90td3beHf184OE8/877Pmdu5ss57zlnYgIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAI41Xde9U9X/EWVfPQ4AwBjNzMxM9n2/c2hHWLs6yv56DgAAYxRh7Z4IbV8Z2hHW/hbljXoOAABjFOHsX0M9wtsZ0X4uAtyGeg4AAGMS4WzbcPkzwtoJo9HoD1Fd1UwDAGBcIqQ9VP9eLep3Rt9F9RwAAMYow1qU7aW5Kn+7FuWsgyYBADA+JbDdlPX5+fnjS3umnQcAfILNzc19se/7W9r+lSZCzB0Tn47fdq3JAOemAwD4lIh//BdH2RPl0XZsJRmNRk/GMbx8LFwqjDU82PYBAHxsES7+FGVrlN+1YytJrP/eKA/0fb+lHVtusY7H2z4AgI9lw4YNJ+djIrIeIWNvO75SxNp/mNs4lh9E/bp2fLkJbADAkolgcXdV379x48bP1uPLIb735jy7d4hyb7tPrTxE9ulSvzLKj9s5y01gAwCWTIa0plzQzhnE2La2L0X/M21fIx9DcdReUv4hx/BYO2eQ65ienp5v+zOoRtA7pe2vxfiNbd9gNBrd1x0cMl+r2xkk231Ss+6jVtrvBQBWiAgZV9Tt/MceweKbdV+t++jAdtjfvsWcV9q+Qb9oyyHKee0+ldVTU1OnD41169ZNx/w/1hNquY4PC2ypP3xgu7bt+yidM2wAwJGKQPHrvrl0WM7G3FzqC5chY86O4YXjGdgi5F0S5VelvbtsnygfsToDVum7PMoL69ev/0Zpv1zmLJn4rq/F577Z9J0Qfe+U5qr4/rMjoH0u+jbHcXS5jgxssX06SnZsznk5OerfLts9GQJjuy8DYG4nJydPiuO+Zview+kENgDgSESo+UW3GM7ez3aEmrkII38ufXsj2EzG9vc5Ftv7h/26xfdZPhHlqmzHPj8q/UNgy/oDuZ2dnT0z6n/vyg0A3RIHtvi8C6L8O9e8du3az2dfHNft0X49+6I8t2nTps9k4CrzM5gtrKMEtpeGz4rjPbfsf0aZ85eofz+qa+Jv89Vov53BT2ADAI4pETh+FuX8qB5X9W3LsBfB5efZjvrO0v/fwBZjN0R7a+nfle1SH8sdqBnmYg1fHtq5jhLY3pqfn18bx3BRnpXLsQyuZU6+9un8KI+U9lsx9p3u/7j7NOZe3vYdSt6tG/v8JspdsZ4d+TfM58q18wAAFpRLiH8tzeMiOFx/0ISJhWB2at2O+TPD2awUn/GlenwcYk0XD/VY72/7D/4Wrn0jwqrh8u/QzjNrVfuoibXuic3qqv1iXn4+MAMAoFIC23AjweqoX3bQhBUiL3XmsWQ9jmFXBLa+mXLM6MpjSar281NTUyfWfQAAjFF34BEcD0fIPKcdBwBgzCKo7a5C2xE/N21mZubC7jAPHAYA4H80Go1m63YEre3DjRJ5k0c9Vot5T9XPoGuNyuNXAAA4QhHKbmnbs7OzX4hAtjXKs1FuK/2n5KNU8plwE4u/Ldwf7Z/kWLnL9NaYc8/wOQIbAMASiaD16lDPsJYhrWovnGGL8PX1rjw7Lrbv5g0VGdjqM2wZ8GL+T4e2wAYAsAT6xRfX31HKbVEenJ6ePq0aHwLbFd3ioz8ymL0X7UurwLYm5n0rA1v0bxr2FdgAAJZBhLCnuvIO19helpc8+wOv//plX15IH9vvRUD7bvTdGuXuubm5zbH9Z/VRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAfFL8B6VMTYQ0sU2rAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAbCAYAAADlJ3ZtAAACvElEQVR4Xu2WW4hNURzG5zguuZOOo3Pbe59zOJxEOSkhYUxS8oDwZsY10dQ8kUsMT15GeOFFalweeZiM8jDkRTNRUyQvPEzzRBnKkzR+f3ut7POf4RyZ7En7q6/1X9/61t7fXnvtS0NDhH+MYrE4K5fLrXEcZ0mlUpkkWqFQmJ9KpaZpb6hwXfcEId/BKwS+SfsabT1tXyKRmKH9oYFAFwj4MLiCBHXRh2BP0BsqCLMaDpNtsR6TFUZv13poIGiHhLV7VI8RuFHroYFANyQs3K/HCNo02kWEBm7zYRNWOEjA+9lsdpv2jRdMIPBFgn4LhBZ2MxbX5nEBVnQu3ETwywT9agJv1L6xBO/1BOe4BZ/psRHwPG+51gRMPiphCX4koHUEPb8Dx12Hf4fWRwO+FfCt1qtAkAXybtW6wHzFZGW3SD+fz8+mfqp9vwLzz9YbFm+5nrC7Ya/WBUw+BV/Jm4CD5anvwUF4xl4AiDHWCo/DQ6ymY+YegO/hbfHbDw2eg5yvDe2qbDd7Lnm/1wzLhGuOv3oblN6INpDJZIpWc/3P7ougD+0c2j6pS6XSTOqX8h8hfepHTmBl0bP0P6TT6YxQ6mQyOd0cp3ZYDH3wNHxDwEuOv2qd8DGvrqVBrw5bLpcn0//MBS20Gv0ueMzUVWEN4hx3peM/D5/sOeoKS8AmaWU/Uu+U28nEPUgxZa0KS+vJCtIOM3eR9dDvhudN/SOs/MWxkvOY79Lvp2lmuySpB2iXmWPXDvsnMA9cv9QmUIz2OdxuLBOpP+KrGM8D6l1wLWE25/wHrlPG5DmgHpIPj2w5WeExDcvtnspJeyUc7V7RZFXp9zj+L+UT2Gr9eFrgdcZO0s4xgbrwbKXfTn0H3qVeZXxfaNt+nvHvEeegnhZl38oe1ro8VGyDKQEpZvbpiG0WIUKECP8ZvgNo3LgVKYreIgAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAyCAYAAADhjoeLAAAEtElEQVR4Xu3dW6jlUxwH8DFzQhIGRzm3vfeZQ9NJKLmFyDwoJUIpl5JLwhBPIvcouRSTSzGKDg8eKA+axiiXB5fBizSRMvOglIQUhcR3nb329PdvH9EZ50zj86nV+q/fWvu/19kv8239zz6zYgUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA8D/T6XSub9cAAP6xbrd7YgLFL2l/1PZZ2rtp96cd3l6/3Br7/C5tR9p7aa+Nj48f0l67O5iamlpX9tuuAwD8awkVP6ZbNRj3er1jUvu9sWS3kX19PKT2R8LnSe36cquhUmADABZnZmZmNKHi5XZ9WDBabhMTEwcPC0CllrmZdn2xRkdH92/Xpqamptu1YbKf8ezrymH7BQD4VxJAnup2u2vb9QSNz6enp6fa9eWUPW1oBqBO/9Htt7ncq7FslymPjPMZHFiHqzJ+6S8LFlAfNc/lsz1OYAMAFqWcSg0LFAkaVw+rL7eyp+ztucF4cnJyTWo/NJbscnm/U/MeWxLCLm/PLSRrry392NjYfn/3Oebely1039S3Zv6cdn2gnoy+364DAHuY/IN/1bBAkdqmYfXlVvbUDjipvdvr9Y5u1naxkQSnzeVxbHtimOzvoLLPZmuvacr8Fe1akfpbude57XpT1nzZrgEAe5j8g789bUezlpBwbGov5HJlXfN4eTSa+t21FXenvqH8jle3//hv4+Tk5FHpb097Nu2JhR6nZu7stDsWau31TZn/ujlOkLq0UwNR3v/47OWmjNenf6zOn5Lre9LfleFIfY8yf3r6+9M/UE4Tm/dsWZV1F5eL9Cdn/evtBU31NO7pZi2veSeBslPnV2f+vvQXln2VWqcGttRuTLulsXZz5q4b/Cz1XjenPToYdwQ2ANjzlbCTNjcY1yD2XWvNT6mvTYC4M9ebcv38mjVrJnO9ods/TfqwBLf02+sj1t/TnszcWc37LFbu2Ut7cTCujwR/zr4+qKUSruayt8M6/WC3V/o36mvn0h7Onq5Ju7WufabbD247f/628rM2x3mvdXnfA5q1pqz/pKxp1nL/LSVM1usnOv0Q9mr5Jm6tzQe2Rv9p/RnKKeeDKa3M+jPq3AXpRnK/0+pYYAMA5kPBVyWwpb+khIiUVnb6j1J/qCdvfwk1qf/aHC+lTg1f6beVvnxhIAHq7exxa2rlm6RHDNbW4Lakyila9vFKOT0b1EpQKwEtez2yjktQu7f02eNFtfby7Ozs3ukfymun06+vdYENAJgPBV8kJMzWsFHCxMZST5i4J+3cjD8s416vd0Jd/1vz9Uup0z+BK4Hym7GxsUOzvwdq/c20bRmf11h7284XLpG85yP1T4WMNGrlZK2cBp5fx99P9b9dWj7rnY9Lc33m4DV1fEVHYAMABsrfFCv/m0D5xfuEhdUzMzP7NOfL6U9zvIzm//jv4G+ylb0OfidsIKFt3+Z4KSVgfVS+Obqi/0WGG9rzzRPAgXzuE4PrMr+c+wcA2OMlsG2pX8Yop4DzJ2oAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPyn/gSwrgEY6Pn19QAAAABJRU5ErkJggg==>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAbCAYAAAAK5R1TAAACZ0lEQVR4Xu2WTaiNQRzG33uPsOP6qvM57/mwOSEUKcLWihUbyUZyonxsUJdc4S5YsHGLpMTG2sJHVyx8xeoWdW/KCklYXaXE7/HOy/i7dsd7Uu9TTzPzf/4z88ycmTlvFOXIEUX1en2tc+6b51f4Ab6CY/AhvFGr1Y6Uy+W5tm9PgJkRmY3jeFUYp73RL2Ks1WrNCLWeACPP4FsbF4g/mGoRmaNSqczxu3bdagLxl9LJa1ktUwQ/b8dqxDZI42icslrmwMg5malWq4vSGMYGiJ2A73WZCPUFXXoDdnQcQ5/g7YCj8CMcIqVg+2QOTMb+p71sNXa46RdwzWqZA5/bZVSl1QTnbzzv7RKrZQpMXPQ72rCagPZGeqlUmme1TIGJFzJj4wLmt4bHgqOwgp0/Bveqjbab+lmercU+fzWx48qhftQPM43YIO2TylcbfZ1LLuoB6sNoO3zu1CCxLiPwahjnH2g+A+wjPskgj5vN5gIvFYidhlfUUFyLJGcNzT7qd9Ix0hzlM9ZO1SkPaRF+nAvwuTf9I/cPICyHj+AXlxgVJ+h0n/I1/Ez9FtwVmRuP1gkH1mSB0afUz8PNjUZjVrvdnk5s0iXP3yC8pDnUT6bJG/k5cLeh3fmL0Ujm0A/Svkf5pFgs1rQJHI2Fv0ZIIKNoZ2y8a4iTVyI9Kv3U38moLhvacJpH/C7t2VoI5aY0rt32+uF/alTnlwlGmXwLZYdynMlvUi51yTfBftrbdASUz7O2Uufc//RDcBm567Xr1Cco99g5uolCetP9h0q/6kw6oA8czLnfsqPk4mJwpo3nyJEjx3+I76VAsh3t569PAAAAAElFTkSuQmCC>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACwAAAAbCAYAAAAH+20UAAACW0lEQVR4Xu2WPWgUURSFlwRMoYU/LEvYnzf7U+iSRKuIKClsLEUEGzVVRGwsVEhhlES0jRBMFNmAURsLW4NY2YgQBO0SosZCSaGIChZGgn6XuS95XLLYmJ1A5sBh3rvnzryzd+57O5lMihTNEUXRfufcL/gn4Gc4C1/AZ/AG7LT3JgoMNcRsqVQ65GP1en0LscNwHr6rVCql8J5EgaE38AfDdquVy+W9aMtwwmqJoFarZaW68LHVPNBewe82nggwclwM089nreZBqzyVnA3RFpi5rYZ3W80DfW7DGMbIe/jBxj3QOrVlpCXarN5SFAqFmlZ3ymoevIEzarhhtZYDEwNqZsBqHmjTmnPAai0H1bsnZqTSVhNwpPWp2TGrJQKMLLgm/Uub7ENbhA8zQe8yvwhvyQbkB/WQNyzUewTD6NfkR2az2W0al3/UBgUaLBaLXfqcIThJ7ATX8X9uaJL2uLh6D8I41e7WRb9Gaxx1Lt6EPyM9VVjwKvNpGRObqlarRc0bY75d82fEfC6X28p4gTV26v5Z5v5+rhPkHgnXWQEJB0l4CZfUsOUnF1eo6fcD2qI3zPikU8NcR+ET2ahU32nsMnwNryjfenOMl/L5fGH1yesEFvq4lmHQ5uKNfB9+k9cM7kjlg9tXIIblLdj4fwcLzWOkLmOu571hFxx9GBmBR9FPEZ/xcSrfG1T/d6sMX4DjmDkNbzL+wsLnGD93cVscY/5Iepb0duZ39USSlrikz7judA/5t7WuYNPkMbGDHtwlm0hiMudjqsOfBCHkc5V41cZTpEiRYpPhLx9Xr6sNU3uFAAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACcAAAAbCAYAAAD/G5bjAAACSElEQVR4Xu2WzUtVQRjGTSSkKIugG/drzv2AK9dNrcqNEiakSC0qCIo+XGTiol27IISgEAxaKRItFIRw1aKCK2VRCS76BwqCNoFERRupTf0ezxwcR13drgfiPPAw73ne98w8Z86ZmdPUlOB/RD6fP2GM+QrfwwX4EX6vVqs73Tq0D3Ce+leqD4LgmJtvKBjwFvwDa+l0epefx1QPuR+YukK83883FIVCwVhz3zDQ6ubK5fJe9JfoR119W4GBFzLIzJxz5Ba0p2gDjrb9YGaG7ew9jjRMPYI33LpYoG8JY7/gSrFYbMPsdbT7fl1swNicnb0pOIPU7NfEBmbrvDX3zl8YsUOv0pob9HOxA1PTMpfNZst+LnZgbJlF8NnXBfSzzOw9avrs3qeNe9rJX+R6VDp1V6WVSqWDXD/g+nYulztl6y6hjWt30IKj7Y762BLccMS+Ui2EDUilUrvJLdDhNV0TH4e/FTNwiUEmFdMeQh+zNYvUdyimfa6TplKp7DHhcTlld4Sb0RgbQFEnfGPCbUTmlmEt2OREQJ+NzGUymWxkjhnKEX+Bo+R7kZo5dbq4/mnCGRbn4R3bzzN4wem6ftDhzGbmBMxUZM6EPwnjGhx+Wrt7DTLHw5/29bpApw/1KhTTHo7M0Z6B/Yr1R0NuCQbK8xAHpNvPYrVGr/ifm9PHC58E4X44YsKzeMKae2sXhRbEkOqJB2HNanf1x0N7WYuO9jU86Y9RFzQDdF4kbLGtTO+j2aGFoaNv/R2r+XblfT1BggQJGoy/9hWY+aWyWzgAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,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>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEEAAAAbCAYAAAAj4uLUAAADaklEQVR4Xu2XTUhUURTHx7SQPqioacJx5o2jpUhB5CYryGoVLQJbtAsqi5K0Iiyz7zCKIhRxUYmRJX1sCuxrURStrLAIiTZCi1bVQkloESL1O75z8XoxsRgjXvOHP+983XvfOe/cO3dCoTTSSGM0xOPxlZ7nPR4PCwoKwu74wCCZTM6kGM9J9EcikSizfdFodA7283AQNcv2BQ4k+Rl+DY2SKIWZRZE+uvZAITc3d7F0Abzn+hRZ+J65xkCBBCulCHztA5ZtKbwiciQSmYZvz/CIAIJkb2onlKopA/kGie8YERhkkPAnLcJT+BoOis42ibqxgUQsFlukBRg6D9Bz6IDNHIbdbuy/DvkJJ492+ML1jQlv+Dw4aGwUoAhbsx2XSjD34ZycnLmuPRXw/LPsg2sfEyR/SzvBnAehcDg8Xe4HdlwqwVpPJqoI5FP820Xw/POgDzHT9RnQGauIqee5i2cFCzUgn8Q1SX2n4X7ks/i267AM5GrpMDlg8/LyPI1vlKJjO4O801pjg8Tiq+S5wti1xc95/oWtRu4sYtdtXEdsFbZNsp7OI108/iIwQYm8EAM7XJ+DTOJaiXtVWFg4Q/Uuxh9XuQW+14JclwHIJ5C3iixjkN/l5+fPE13WtDuBedbCq0bH/wCuLikpmczzTVx/npmzG71C5pF3Eb/aa4k5pvL4ikDQGga95DkgL6TssV/EBf4jnnVOJPyu6FH5EGMvGl9xcfEUfP38uiwwNvT7cLfKI4qA/ghuM7p0BHPexrYcDppkDWQ92GZ0YkrhF/WNrwh/AlnYLgJyOey1fBeMT76UJMp/koVWvCR6SuWhIuCPh/xOegsrTKzO9wyug/3GboCtCV4zetz/EzjAuOy/UYTLRkeuh+0q13lWEUL+ZUvuG+Wqy7W7T7afxn/njIjIOH3xRnwNZjB6B9wnN1ViepGXWfNsVHaF9BxAroF3RNazYkKL0MlzC6yFbfKSPMvi/j9Q2U5VJl66wPO/ZpP4YbXxYWth3F6ZU3S6Yiq2u7IdpQDIrbKlNFa2RKfMLfteu0fschhLd7XCh3RfTM+KS+jfpIhmvZTB8792syZe5Pp/BTkXTEI27K1iwLzzSXS2awcZ+Ja482DLJj5p2yYUnt/+La79v4G0PAU4qlzv+tNII4000ggAfgJgsPsE3rubQAAAAABJRU5ErkJggg==>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAwCAYAAACsRiaAAAAFiklEQVR4Xu3dWWhcVRzH8aR1X+sSo5OZuTOT0dQoLkQFq4jVQl/cKFhERXABoVJ9cqtYieiLKAr2oW4PVftkEcRqqTV9KAoiKgrqiyhSrQuCiqChiujvPznHnP4zmSbkzk0j3w8czr3/c+Yucx/On3Pv3OnpAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAFLlcnlgZGTkYB//P6tUKiUfAwAA+5Fl2ZcqH6v8mMTWqOxQ+Sztu9Do+L+r1Wq7VH8TY0oYzqxWq7sVe69UKh2R9i+SkrXDdRxn+HieCU2z2TwmXMcpRfte4fsXRft/XVWvjwMAgGkooVmiAfQfDeBXJuFexbbW6/Wzk9hCtEjntV3n8mga1DmPKn55Giuajmlduq7juUuxMSVs56XxudI2n7DrG9ctUdT6XpXlab8iWcKoa3CzjwMAgA5sQFf5JFl/O21fyPr6+o5KExYtf6hENEv7dMvw8PAhPmaUnK21mb828Xu6kLB9r/Kri41Nd2wFWaRj+M0HAQBABxo8H7ekZmho6GjV7/r2hS4kbDZruNm35UXbfilZvrBT0qu2cZVbfbxLCZvNnt4blv87xvmmY3rSxwAAQAcayM+1gV1lS71ev8C3HwhqtdqmrM2zWLH4/im1/6AEYaPqNb4tR4u1/RtswY6n0Wgc6ztE9l3reK7w8W4lbCofqfwRj+9AkLlbwgAAYAYsqfGxAtktssd8MC/a9uZyudz08bxpP8tVfvJxLyRswz4eErbzfdzYLUxLBNsVJdln+f7GfmCh9q0+Plva/iU+NlPa/1c+ZpSAX6dqsY8DAIBpaPBcakmEjxdF+75Mx/CUj6fUfo7KpdMV3z+VJb8S7SbtZ0yJ4fGqr/dtqZCwXeTjlrDlOcOp/dwRb4fOhbbxkI/NVIeE7XYfAwAAHWhQ3eITNq2vskSn2WweqvoNiw0ODlas1mC7pFKpXNUzMTO2M/Qft1+Vqu3kZDMt9rySDdz2zrH42oo4YKseVduDtf0kbHPhzy3Efrdax7beau1/U6jtV7On2I8V+vv7jwwJ2N/qd5PaVqbbSKntrWT1IK2/lqzvQ9varXJnm/j6ak6/Xg0zcjZrOmUWS/EXdHzvW1tMxtLrp+VbQuxTXfOTsuSWs33OrqPq++x41bbB1q0OnxlLantusG3CpvjzPgYAAGZJA+rpWZiZ0sC8McRuU3mx0WhUVX+e9g8JQFvZxHvdWg+8q142MDCgPKh8atLeSthU1yc/1V3a17ehjs91WfLZOrd4vpHif1oil8bmIpvhrdNu0bncn00mWD+HWOv6WYKm7+C00LZN5WGVHfZON123E+w7sjZ9Rxdr+a8sSYYVu1brX4fPjmt9RdYmYbPb04rv9XEAADBLGlDrKnvC8itpmwb3q1WesWUNyqtV9aYJm73BPy4b9VmbhYTNBnqr1f+asL46JBBPqx5NP9dN2t8XVseZrizM+Ni5KXZj7GevALHEJM+EzWib7/hYUcL3/awtq345xOL1s1mxVaHtF30XI6rftOumPiu1/EHoc7fKq4pvD59rzcBm4RUiqveo/2FZm4Qtm3g3XCvxAwAAObBba/FWqN0etQfZY1upVDpxsue+am1ujXpZMqNmrxRJ24qgZOM4mzWKy+m52XlrfXCyd/5q8/Qcl773dSobtP+lvi1KZ0CNXfu4bIlY2mZ9bQYurlfb/INDKibtAABgfk15bgpTKWl6IM+/opop7fcRled8vAja7zIfAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAnfwLdeIl1BzXZ2kAAAAASUVORK5CYII=>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAwCAYAAACsRiaAAAAEwUlEQVR4Xu3cSWhdVRgA4NTUCSccYiFN8jJpJSqCQQXnXbdiqYiCCxEUwaXVCg6VLlwoQulCLIJai6AgLpxrax1WtnYlgptakFJ0oXVVxEX9//Tc9PZ08KVp0od8Hxz+M913T+5ZnJ83pK8PAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALo2Pj5+SafT+S3K9igHRkdH727Gov1tlL0jIyNPtS6hS73+bGM9X8Qath6v1HMBgB4Qh/ShycnJgaovk4zRdh9z16vPdmpq6pxYxytRnm36IoF8KNp/t+cBAD0icod1cVBvaNpxcD/XHufULcazHR4eHqz7wpK6oxbr2h9hadW3rd0GAHpIvhMUycXKiNuHhobOr8c5dYvxbPMjzvwYtjT7414PHDWhEuOP57pa9c31HACgx+ThPTIy8uHg4OAV9Rgzz+eY73o1JZ7b5wMDAxfW1zQW49nG69+Wa+k7nKz9Z/IVc97NdUX5rsQH6zkAQI8pScWbdf9cxGusqvu6EdfdWPf9n5yOZ9ulpXGv3UNDQ5fVA7WSpH1U6qf8Q4OxsbE7675u5J5H2VP3AwAnUQ7wh+v+uTjVhC2Smam6r9fkrzxPVur5bafj2XYhk7X3Yi23RNxRD9ZyTc2vVCPp6tTj3YrXeL7u60buuYQNAOZgenr67Dg891Xd/XH4f79ixYqLYmxXHsyZdMThfkPErTH2QrZzfGJi4sq8oEnYsp3XZr35kn2MbSn3eTvKtihjUW7Nesy95shtjyj33h3jj8XrrIn6zmXLll0Q8ZfJycmLI/6c82L8/ghLIj5a2uti/qsxvqfcc2/2R/y1xI9jztqIL5f5a2duuABO9Gw75WPLiPtjrbdH/LK0N+e68m8p68q5m6J+V3PNcZzVqb6zFvO/abfbyi9E/4pqfzWU93qj3vMoBzvVnkf8MS/I/oztPY/4dBmb3fPSPmrPOxI2AJi/OFA3lnhvlD8ysWiNHRofH7+61F8scVVJpDa0Dul/li9ffvnw8PBNrWv3lmomCAfz8G7GajH+aVOPeW+1x/K6eN3rsh73GApXNWOd1hfpI/5U4kzCFn/Ha5kM5d/QzF9s7bXlc80fDET8OpOeXFf7b8m1HrlyYTX36rT2vEnEcl2tPZ/Zl4hb6z3Pa+o9j77VpTq75x0JGwDMXxyor5e4Pso7cQDf0Rr7IQ/1qC6Nw3g6+yLeV94tWhVlV5n3QRlbU+Lq6DuQ/5ts9PDHd/uapCtF38qmXuZ/1tRj7s6MY2NjN7f6djT1uPaejGUdT3SOTdhm3umK+H5J2Gb6z4S495YSfy9J0Uul/VWuq/lbSt8zTX2htRK22T1vJWyzex7xz9L3yXH2/MmM7T2fmJgYrve8I2EDgPmLA3VjfgRZ97flx2tNvRzK5zbtOKjHm3pqv2vUd4L/E9YkDCcSB/1Eu53v5LTbseaxdrsWa7o21xn3OS/bOb+pL7L+eB7XR5mM+lmxrkvr75KdiXVlcjiXPU/z3XMAYB7i8N5U9y20uOcjdR+LJ57/+roPAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA40/4FG08z7ukuDLgAAAAASUVORK5CYII=>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAbCAYAAADlJ3ZtAAAC/klEQVR4Xu2WS2gTURSGY62IL7BKSE3SzLQE4gMXEh/gCx8bkYJSxY1K1UJFQTe6UVF3Il0oiDvBjW7sRrF1UV2IxYUuXAgKIrpJUXxAfRQREanfMWfCzbGTmYJZmQ8Oyfz/uff+uZm5SSLxP5PNZjPFYnGa1cNIp9MzOzo6clafNLJoW1vbct/3NxBinvUtsigMJZPJ2dYLI5/PT/c87w7jFlsvFgTLM/gWk1zj9Sx1jvcj1CDh07ZfYMwM+h5TS6ynNOH1WlFg3nbqKX6L9WrCoB528iW1ytVlZ/GeMGEJb67rCXgnqQuuJjtMfyf6aeoF9dn1Xeg7g3/V6qHQ3EeNEmah9QS8TdQ4/nlXl11Ffyc75Or0tUpQXg/xej8ibAv+WNjaVdC4Q4JQPdYL0FDS88jVWegIiwy7moUxA7XCCnLr2Y34C/2K31LvI57kZnp+UR9ckUUeoPW5miVOWIKekPve6lUwyTHZMRovWs/FKz8IsrPPA00+HNffvRrfiBAnLH6XbAZvp1ivAp/orobttJ4Lffs0bH+gtbdL/uixccJy0qyTucJOnOCc+yFNLJyyvguBhjTs7kDjFlqqY1e6vZY4YZmjoGFXWO8PqVRqlgYY53Kq9QMIWtS+V1w2BzrXy0TPRRzqGvaL1V3wF+hcm61XgYbXXvleqYSwcAvc0LCHje7rAmtc3aJhv1rdBX+RzOWbM74KzNu6YNF6At4BDTrIZZPrFQqFOeptdXWLhh2zugv+ag3bar0K3CvrafopoRMmDB9gl1c+rm76E/xyCfSUqKNWd2H8Peqb3HbWC2D+bs8cixMiTzONbxgwzPu9+uT3U8+43mP7Xei5Ql23upzfufIZ/El2TGtUgqOvtf3ol3XDoslkMvOZZCeDjvPaqzd66EMXQP9G6qOcLNabBPJHp8Q8Xdb457DIQ3Zlv9XjwthtzDGSMLdhXWCx7RLY6nFh7ABzbLF63WDBSyx40OpR6EN8yup1RxYN/bmcAIK2+FH/tBo0aNCgit/uuc84F1u2sQAAAABJRU5ErkJggg==>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAbCAYAAADI1VnXAAADT0lEQVR4Xu2YS0hUURjHdZSI3i+bch73OjM0ZS1sU7lJwqIHUYsSAnu66EGLgiJJKcKIXmDRIiqLCoUgokVREziURQ9IiFZtEgQ3gkVFEKEb+33ec/F4mspBF3nn/uHP+e7/+87rO+eeOXfy8nz48JEJ0Wh0pWVZn+E72AY74NfS0tJxehzaR5gm/rnE27a9TPd7BkzuGOyHrcXFxRNMPwmoxPeNBOzEnm76PYOSkhJLJeILkx2v+xKJxBT0Z+hLdd2zYLJPJRmseJUmF6I9Rluvad4GK75P7Yq7rkYCbsIDepznIe8+SeiFP2Ox2FQSsxftghmXEyAJ99SuaIItSAEzJifALtiiEvHaPDRzCvI6qETUmL6xBuZQz1VglqkPC1RulkSEw+GE6RtrYB7pkSSihwOyy9QF6JvZMWeJWavuFnIJa9b8W3luEJ24XaLF4/HZPF/i+UQkEtmg4rajNcqvlBzGlBVuG5lA7CF4GZYTf5zynD5Bud+gXcdXSx+LkAJoF2VB0U7LLtea+zeouFgqW84h+RuCweBEfG00vluesVfAPrEZQJwOr4pNOQf9vIp5Q/xCsSmfwMpkMjnZcq70TTJItCNuH5kQCoXCxP6AJ3kMyM+5TFR8aHNhe1FR0SQ1vk528wzl689qR1ChHL60nJ/OftgDWyXTGWLvuIlQAxxIBCsfwe6GDfhXIQW4rS7n+bvl7BxhGp5S7aRgtdb0X0HsJ7XaYlfDh8quh++1PjoY92rlyy4R2YDGWzIlQsDEk5bzasgHWqMacOdg7UGgpxjwRlP/E4jvJn6+sqXdR2Izlivot4dGO3ATwZ0oymOB6R8RaPyG+85RlrmJoNwE14ktX6743kJb/CRspuhq6w7EyGtiJgKtCv8CXXOB3mMkIiV21DmX2t04FmOJfDepuF7sIGWdPdpXARqsgA9s576xX7Iuq6IS8UoNTA7LPRKPXQNblXZGvmwpdxDXRfkCrnHbJuaDnWF1ia3F1yf9yBmDfR92Ym/DXYB9DfuW9AEPu/Us5ww6CI9qzY0eZGXpOIZZqEpJ0DSKfDk05Xo+tMaAX1Yz39RNMPg6UxsOZBdK36bOWOaZ2n8P2VUkrMzUcw62V//18uHDhw+v4Be3dOHo9gwCpgAAAABJRU5ErkJggg==>