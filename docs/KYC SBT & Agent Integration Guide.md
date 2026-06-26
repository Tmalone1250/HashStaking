# **KYC SBT Registry & Multi-Agent Integration Guide**

## **Compliance Architecture & Agentic Coordination on HashKey Chain**

This specification maps the complete architecture for on-chain identity gating inside the **HashStaking Compliance-Aware Multi-Agent Wallet OS**. It outlines the structure of a stateful SBT registry (Method 1\) and details how autonomous agents leverage zero-gas pre-flight checks to prevent transaction failure.

## **1\. Decentralized Identity via Soul-Bound Tokens (SBT)**

In an institutional staking environment, capital pools must be protected from interacting with unauthorized addresses. This protection is established via a non-transferable on-chain ERC-721 token—a **Soul-Bound Token (SBT)**—acting as a cryptographic certificate of regulatory compliance.

### **⛓️ The On-Chain Registry Interface**

The staking contract does not parse passports or corporate registration documents; it queries a modular SBTRegistry contract.

interface ISBTRegistry {  
    // Returns true if the address holds a valid, active Soul-Bound compliance claim  
    function hasValidSBT(address account) external view returns (bool);  
      
    // Returns the specific regulatory verification tier of the account  
    function getVerificationTier(address account) external view returns (uint256);  
}

By querying this interface, the staking vault remains completely stateless regarding identity parameters, querying only the boolean compliance status of the target wallet.

## **2\. Stateful Registry Mechanics: Minting & Revocation**

The lifecycle of on-chain compliance metadata is governed by a trusted **Identity Issuer** (typically a licensed financial custodian or KYC oracle).

   \[Off-Chain Verification\]              \[On-Chain Settlement\]  
User submits documents ──► KYC Portal ──► Issuer signs Mint ──► SBT Registry  
                                                                      │  
                                                     onlyVerified ◄───┘  
                                                           │  
                                                           ▼  
                                                \[CompliantYieldVault\]

### **The State Transition Flow**

#### **1\. Registration & Minting**

* A corporate entity completes off-chain KYC verification.  
* The authorized Identity Issuer calls mintSBT(address account, uint256 tier).  
* This writes to the on-chain storage mapping:  
  ![][image1]

#### **2\. On-Chain Verification Gate**

When a user attempts to interact with the yield-bearing staking vault, the transaction triggers the onlyVerified modifier:

modifier onlyVerified(address account) {  
    require(sbtRegistry.hasValidSBT(account), "Transaction Blocked \- Missing Regulatory Identity SBT");  
    \_;  
}

#### **3\. Revocation (Compliance Lifespan)**

* If an entity’s corporate filing expires, or secondary sanctions are flagged, the issuer invokes revokeSBT(address account).  
* The registry updates instantly:  
  ![][image2]  
* Subsequent transaction attempts by that address immediately fail at the smart contract level.

## **3\. Real-World MetaMask Live Demo Design**

To demonstrate this system to judges or venture capital allocators, we configure a live browser-based account-switching scenario instead of using local mocks. This proves the smart contract acts as an immutable ledger gatekeeper.

       \[MetaMask Account Context\]  
                   │  
         ┌─────────┴─────────┐  
         ▼                   ▼  
    \[Wallet A\]          \[Wallet B\]  
  (SBT Verified)      (Unverified)  
         │                   │  
         │ (Gas Clears)      │ (EVM Reverts)  
         ▼                   ▼  
    \[Deposit 200\]       \[Deposit 200\]  
         │                   │  
         ▼                   ▼  
   \[SBT State: TRUE\]   \[SBT State: FALSE\]  
  Global Accumulator   "Transaction Blocked"

### **Setup Execution Steps**

1. **Deploy Contract Structure:** Deploy the SBTRegistry.sol and CompliantYieldVault.sol to the **HashKey Chain Testnet** (Chain ID 133).  
2. **On-Chain Whitelisting (Wallet A):**  
   * Generate a burner address inside your MetaMask extension (this will be **Wallet A**).  
   * Fund Wallet A with faucet HSK.  
   * From your contract deployer wallet, invoke:  
     SBTRegistry.setVerificationStatus(WalletA\_Address, true).  
3. **Leaving the Default (Wallet B):**  
   * Select a secondary MetaMask account (this will be **Wallet B**).  
   * Do not interact with the registry contract from this address. Its mapping remains uninitialized, resolving natively to false.

### **The Frontend Reaction Loop**

Your Next.js dashboard detects Metamask’s account changes dynamically:

window.ethereum.on('accountsChanged', (accounts: string\[\]) \=\> {  
  const activeAddress \= accounts\[0\];  
  // Query SBTRegistry via provider to check state and toggle active UI theme:  
  // \- True  \-\> Active green badge \[Verified \- Level 3\]  
  // \- False \-\> Inactive slate badge \[Unverified\]  
});

## **4\. The Choreography of the AI Agent Swarm**

The integration of autonomous AI agents within this compliant architecture utilizes Google's **Agent Payments Protocol (AP2)** framework. Since autonomous scripts (running LangGraph loops) execute transfers on behalf of the user, they must handle compliance gracefully without wasting capital on reverted transactions.

Here is the exact choreography of how the agents operate during a deposit sequence:

\[User\] ──(Intent)──► \[Orchestrator\]  
                            │  
                            ▼  
                     \[SBT Agent\] ──(STATICCALL: hasValidSBT?)──► \[EVM Node\]  
                            │                                         │  
                 ┌──────────┴──────────┐                              │  
                 │ True                │ False                        │  
                 ▼                     ▼                              ▼  
          \[Strategy Agent\]     \[Orchestrator\]                 \[SBT Mapping\]  
                 │                     │                              │  
                 ▼                     ▼                              │  
           \[Exec Agent\]           \[Show Error\]                        │  
                 │              "SBT Missing"                         │  
                 ▼                                                    │  
             \[KMS / CP\] ──(Sign EIP-712 Mandate)                      │  
                 │                                                    │  
                 ▼                                                    │  
           \[Submit Tx\] ◄──────────────────────────────────────────────┘

### **Swarm Node Step-by-Step Processing**

#### **Node 1: The SBT Check (Compliance Agent)**

* **Goal:** Perform a zero-gas pre-flight compliance check before preparing any transaction payloads.  
* **Mechanism:** The Compliance Agent triggers an off-chain JSON-RPC query (eth\_call) directly targeting the registry contract.  
* **Verification Logic:**  
  * If the response returns false, the agent writes to the shared state graph:  
    state\["is\_sbt\_compliant"\] \= False and state\["reversion\_reason"\] \= "Missing Regulatory Identity SBT".  
  * The graph halts immediately, logs the error, and alerts the user to update their credentials. **Zero gas is wasted.**

#### **Node 2: Yield Math Optimization (Strategy Agent)**

* **Goal:** Determine the exact staking transaction thresholds using the Model B Reward-Debt formulas.  
* **Mechanism:** Computes the globally tracked Accumulated Reward Per Share ![][image3] and calculates the user's expected pending yield ![][image4]:  
  ![][image5]  
* It outputs an optimized allocation plan, preparing the AP2 Checkout Mandate containing the target staking values.

#### **Node 3: Signature Assembly (Execution Agent & CP)**

* **Goal:** Assemble the dual-signed cryptographic payment mandate.  
* **Mechanism:** Connects to the local secure Key Manager (acting as the Credential Provider under AP2) to sign the typed EIP-712 structured payload.

#### **Node 4: Transaction Submission (Payment Processor)**

* **Goal:** Submit the final verified bundle onto HashKey Chain.  
* **Mechanism:** The automated relayer executes the on-chain deposit. Since compliance was verified off-chain at Node 1, the transaction settles smoothly.

## **5\. Peer-to-Peer Transfer Enforcement**

The real test of institutional-grade compliance is protecting the secondary token market. If Wallet A tries to transfer interest-bearing vault shares (![][image6]) to Wallet B:

1. **The Vault Intercepts the Transfer:**  
   * Inside the ERC-20 transfer and transferFrom hooks, we inject our compliance checks.  
2. **The Verification Query:**  
   * The contract checks if the *recipient* address is registered:  
     require(sbtRegistry.hasValidSBT(recipient), "Transaction Blocked \- Missing Regulatory Identity SBT");  
3. **The State Reset:**  
   * If the recipient (Wallet B) holds no SBT, the transfer reverts at the block level.  
   * If Wallet B passes the check, the transfer clears, and the Model B math recalibrates both users' reward debts:  
     ![][image7]![][image8]

This maintains a completely closed loop of verified users, preventing regulatory leakage on the secondary market.

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAcCAYAAAC+lOV/AAABEUlEQVR4XmNgGNRAXV2dV0FBoQBdnCggLy/fBMQ/gUxGdDm8QFFRUR2o8TsQ/5eRkRFCl8cL5OTkdgA1PgZpBmJNdHmcAOhPf6CGqUA8F6QZyHdAV4MVGBsbswI1nAZqEADa3gbSDKTD0NVhBUDFpUDFqSA20IBCqLOz0NVhAKBiCaDCvQzQ0AXy46HObkRTigmAChfJysrqIPE9oc6ejqwOAwAVWEOdiA2vRVePDJiACvZKSUmJIAtKS0vLgDQDnX0IWRwFACUrgTbHYhHngNp8E10ODsjWDFRgAZR8B1KIRQ6k+SsQf0KRAAoYAfEZIP4LNf2GqKgoD0weqLEBKPYKKgfCx4C4FNmMUTAKBiEAAG2AS/nQbI4oAAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAbCAYAAACeA7ShAAABdUlEQVR4Xu2Uu0sDQRCHLz5QKxury91t7gFaCgciKPgotRILa0VBUtpZCLZWIqKVIGJhp/+AjY2PVhstRLCwUBDBThD91mxkb5KIZ2s++LF785udm0yycZz/R6lUGlRKnaJr9Ije0BO6QefoCM2R2iLPNoQDO+gDjVdjSZJ0BEGwoOOs63b+j9DhJYce2BakR/xKFywWi570anBdt8d0tS89aCX+rP04jn1p1kDitClWruNNGu9QenUhcVsfYC6pHec5UpWPqL+Q0PYaQuKtLsbcVllXtCi0y/qCDnzfd+WZuniel5iuTig2WhXPQ6yddm4URd3EZuxYBgrNm66WpSchZwRtyPg3mHums2Hp5YZCd+iVbZv0bHjprO4K9UnvC23ortCx9GzI6ydnCm2yX8yYeriqcu/0PdTF3oldsE5kEg1hGA6kadpOzj37XunnhheNoTMZ/xOq8kdQRkv8nLqknwuKbDGvtUajyEtB/fZKNWniOJ9bsl1H+dTrXwAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAyCAYAAADhjoeLAAAENElEQVR4Xu3cS2hcVRgH8LS+FfFtIJlkMmk0EhWUoKIbdeVSwYVY0YWv+sCFiosqulBU1Ir46EZBN+4E0YWoiEUXKqKb6kqkWkRKRcF1C6L/k8xtbo+TUJlJW+H3g4+5539P7pkzq487dzI2BgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACsYXFx8bjp6en36jw2dLvdKzdt2nRuGcxEdX7kOp3OxVnmhmac9be1zwMAHHFzc3MnpEn5LLUntT+1K83Ux3l9rJ47Krn+W2mSttR51vwm+XN5/TJ1e+rpes6o9ff+YTNeWFg4fmpq6rL2nGGVa2aNvam/+7Wr7DX1eurSej4AwEClkUijclFrvD21uT1nVNKw3VZnWeuDarx/YmLi5HY2amkOTy/rpH5t56WZynu8q52NQvmMs+YVzTjHJybbncMNK7MAAFaRxmFPe1y+skx2SzsbhVz3wtKotLNOp3NmaWbaWcY72uNBJicnO3X2X2SNF1M/pv6q8odTX7SzUcg1f8/LMe0sn8dLvV7v8nYGAPAvaaBuTj3YjNNYvFM3MaOSBuWjOotjs97PqX2pbZlzRj1hkLm5uXMy/9NmXPaQ8WvtOaspDWm5o5j573arZjGN4Fl1Nqxcb3PWvHtA/kbyW+scAOAgaRp2p9m5pqkmn52dPS3jm1pTh5a19tZZo3/37bt2s5T3cH77PQ2Sv/s8f/PU2CF+tVie2+t0OieV4/zts4Oas+S/1NkwSkNaZ71eb76/9tL7LnutpgAALDcJgxqWIo3S1amX63wYWeuPOitfiTbHM8vPdR1obtI4PZDxHc14kJx/MvVbna8mcx8ve27XgDnf11mR/JM16oV6frHaZ5y9bm3nZa/t8wAAS9IwvDmomShKs5a6oM6L7nLTs2rV8xs591WdZY3rm+Px8fFTMufPclzugpVnvNb68UHm3j/Wv0OV4x3l33RUUw6Std7PnPNa4+sG7b87wq+EB33G2dPZyb4tr/05j5S9tucAACxJo/BTan+dp5G5JPmreb2nPjeM0ry0x1NTUxPd1nNo3eXn514px1n73hzvTCOzsPIXK3J+S85vb8ZpxCYz9+v2nFpp6qrxtXUzlevO1NkwusvP5x34JWqO7yxfuZavZpus/znsbMYAAIekO+Bu2LDm5+dPzXWvasYz/X9zkQZmMfmjKzOXJXu+ztZb1nz7cN/tynpPHIm9AgD/c2kg7ks9VOfD6lZ32dawsf9DhK31ifWU97cv687W+XrKmj+UvdY5AMCa0kT06mwUct0by12sOh+k1+uN19l6mll+Zm9jna+38rze4d4rAMCaZlo/NDiaTE9PP1NnAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAc9f4B8YbTnIGJD5sAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAAAbCAYAAAAqCUKuAAAEMUlEQVR4Xu2WW2hdRRSGd4yXeK23kJDbnByjJ4mCkYgVvBURQRTE9kE0+mBMvEBRCcGioEgrYqWKQmIVK2giRo1NpIoaWvXBh1aMCkYxPhgFLd5CEg340DzU78+eictJczz6oEH2D4s9869/rT0ze2bNTpIMGTL8G3DOdWK7S7GGhoYxQg6PcxQDcZ9hB2X19fVnxf5VCQb7EfZiY2PjxTU1Nac2NTUdRf9HbKZQKBxfV1d3NItxYS6Xex5uMo4vBcQNYNM0D4t9qw4sxNkM9p3EDJbJ5/yXHTXSRF+ZxXnNcqWCXFNxvlUL5v8wE73Kci49TlqUXsujXQf3iOVKAYt5mvLxnk2x7z8BW7+JwbTSLAucBllZWXmc2gx2WxLVCLhBTQLduRF/KXaF5QLYcU6LRkxN7AuLrCMYOMZ1smKszkK7kphzaJZbnpjzeE+F6bu/VadI+ijWj00xoPvF8cz7XfBWrA/A9xM2l5iFXAkMcK2KL3YHdgP9T4m9z2rgn4P7tb29/Qh9DO1O+vdiP0cLUw7Xhb2B5i6XLuY+1Tg5aT/p477FrsFGsG3+OZnP588wuZZDXxnhgNo8P8cG1fZFdB/27p8jUmhXuXTRRmJfDDTrsQO86yLDdSiePGca7mvsdf9BhphwNc83vS4fdLm0kH/C5NaY2PdYuIKfTw877HQ/vi+IPUkaXQbitJAh7pBAdLMGZpJ0BB/B19Hvt/oAfLf6wd4Z+yxqa2vr0E1jz1qe+DYff4v6oZ5gO6TVBMQz0cvR3h7i0N/odYvHE18FXDfPJ9SH76TdjF3r818QYuk3isN3W+CKAvGD2G+hhggE36TkVheAdqdeoFsp9lmg2ewHconlzaC71TeT/dKltWqD1QfAf4j94v74J9IVfmWsI//T8DOJuS2dr1mqn0a6MhBPYMMR9wrH6ATLeZThm8NmY0cMP4n5ZHmRVg3TohZ8v085pXNpoT6IddkYr1toKOG6d+lR3Gk54t6GG7fciqiqqjrWD2LpatW2J8lTVhfgz630r8a+GGj2kucDy/GlauFn+Zq7jO5jZ/5PXHrk+tQmfru5Bb/Cngm6AH/cFm8g7QQ/vp7g5105cTzukY72C8G3IhD9QMADvluuBQkFKgb83eYFRYGuF/u+tbX1SPX5Ez6G/h5sSgsvTteu8imvD9NOnFefd5yIvRzy0d6Kb2/oe04THg43lPPHxP4q0L9eHNYif6hlRUHeqxF/w/Nxl9YX3f1LIMllcO9jMz65bAGbwPeS1VroekUz5NKbbYvPMch7qoNGxdTnagmcS6/VcWwUbVvg9aGwMfgdPB/y492YM/8k9B/DvkuW/33v93Hbra8odA3/VeH8p2BXnKIvZwdvUBZqi0E52nW6FSN+EUwsj7855gWVg0P5tFvhz4/5DBkyZMiQIUOGDBn+X/gdmiQ5ZHVYD3gAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAzCAYAAAAq0lQuAAAFhUlEQVR4Xu3ce6hlVR0H8DumRhGk1JTcx+xz7lwtJnvY0OuPYBCVMgkspRAiHyD5yJAo0LJ8UDD0GB0VfMAkaPVHfygR+CzNRJQRIwYTRfOfijKIEBL66/Zdc9bOPWvOnVHQ4XT5fODHXuu31j57r3v/2D/WeczNAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALxiy5YtR3Zd97fEao3nE7sTtyROaOevV1nrC4mdiadHo9G2jRs3vq2dsx5lvf/Iei9r8wDADCrF2uDBvSH9uxMv7zNpnco6r5mfn39raedvMEr/X+2c9aoW6T9u8wDADCo7LTm8aZjbtGnTjvF4/NFhbr0pxUopWtrcsD+LSoG5sLCw2OaXlpY2t7k1lKL8d7Vgu78dBABmzMrKysY8tO9o88l9K0Xbl9r8epI17moLtqz55GF/FuUej07cOyW/o81NkzWfm7iiFmx/aMcBgBmTh/xPlpeXj2vzeZDvGY1GH2/zh8ri4uKxbW6a3OfXyy7RAeLG9pyBw7LG7bVwKXH3XLPTeCiNx+P3tLkDyf0+mHM+kOOF+T/e1I6vJeecUo5Z+7Nl3e04ADBj8sB+oc2VwqE+yDfkoX5OLXwuT9xQ2yeWebW9c9+z9+bvSDxW3lJNIXFPO34wW7duPSLn/73Nv1FyjydlndeVNZe1pf/d9O9L+/RaEJV1/mx+fv6dOf4iYxe0r1HW2tXiMMdHM+fsZspB5bznctjQ5teSaxyTe/1tzrtl7lWeNywKc94jZc3DcQBgxnSTt8b2e2An99dSdAz6q4lP1PZDg/xZfXsoRcSWjP2ptFNUfKUdL5aXl9/e5no594cl2vw05YsCse0A8aH2nCL5Y9pcXeena/u88i3a2n4psau2Lx6eM5R131aOmfPTxLnNcMmfmOte2+Z7GX+0m1IAryXXuySvd3Pi4cXFxfe3463MPzOvf/Wgf1NZ83AOADBjShHSPrDrLtIT5TiYtztFwfYUBQs5Xpb+h0u+L7rqDtWlo7rzlON7u1qwZez8wevsTP+bieW07+wmn6PaWyANJfejpaWlT+Z6K+1YK3NPra+zVuxXOBW5xy+0ucx9quzulXb9O3ymtOuaX6ztq/r5Zc3JX9/3BwXb7fW6h9d7KEVeaT+ZeKQUtP05veS2dpNdzP12PNeSuTfksGHz5s3vSvs37Xgrc369srLy5kH/e52CDQBmU/mdsTyoHywP6yZuHY/HH2zn1x2z1Ry/U/ppP7GwsPCO4ZzyObjkf5+4cFrBluO9yV2RsStTiL0lx23D84cy9+Qynvm727HXS3ntxDO51o5uUmA9NGXOX/qf/Ej7gRSRn8389/Xj6X8k+YtyPL7024It8XI3+X23XVnPw3X903bYDi9/n7rmvX+3A8nfelPmXdPmuzW+4VqumbEXE//Jdb5acuUbpd0r//f7839/d3seAPB/Jg/1PXnYX1Lb5Xfb/rfTlPxdyf2gm3x27eJpBVv6f+znF33Blvy4yR9Vxmrxsvpqv3zwWpWisOwQ5nhGrvXFuSmfAavFzN63EDPva2l/ux8bTZxdCp3yObc657Z6Xl+w7XP/XS3Ypqz5U8ldXtc8tegCADio4Wekuklx9o2+n0Ljl+mfleP2ulN0c/r/7r90kPbp5edD0v5+X/SUXba0P5e5Xx68Tnnr8Z/927FpP5P4cz9+qOXaF5UduL6f+/tY3y67ahk7LbmrMu/nic8n9pS1Jp5O/Kqu//G0r06cUL/A8EBXPw9Y1N3O1a5+YSGvd2U3eet06lu5AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADPjv0JDTz2GEST2AAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAzCAYAAAAq0lQuAAAFlUlEQVR4Xu3dW4hVVRzH8dEuD13tMk2cOXP2PueMTU0X0ulCQTVMCZVRTRMqRKRORDZBdsWkKbWioqsTU/QylGI9ZA+VqJRdsAuVEVHJaC8+hZQvIVT4EPX7t9fKNcs9Mz4MsT19P/Bnr/Vfa1/W+LD/7LPPsakJAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMaqVCp3JUnyl4vdih8UGxUD8dxGpbXuUgwpRtM07W5ubj4mntOItN592kyL8wAAoIBUpPyom/cvQX+R+r91dXUdEc5rRFrno6VS6Shra92p+r/GcxpRtVrtsCK9XC6fGI8BAIACshu3apWlYa61tfUk5d4Oc41G637O1h7nwn4R1Wq10+Kcqdfrp8S5PPp3vU7rHHb/7t3xOAAAKCC7cSvOiNLTlNsR5RqK1jcSF2yVSmVO2C8iXXO/4sUoV7WnZmFuPJq7TYXaDFu71jsvHgcAAAXT1tZW1417TZzXDX2B8u/G+aLRNd6reH+CGI73CUzXOp+ywsXFJuUOiycVla73paassP5Qxdo58XgerffUJvfemq1Z/ZXRFAAAUDS6aS9W9Ofk1+pmfkulUqm5wme9fZSmeEftITdnY97HpioeLtB+m92cp8vlcns8J4/mznYFlH0BYFDxjArK8+J5U03XeoXOu9oKGEWP+o+o/57avVYIufW/XiqVTtb2TY0tiY9ha05ccajt55qzMJqSy94h0/xNijU678NJVoQdFJ1jqeIV7TMrHhuPnSdo2xO2l8NxAABQQLpp78rJLbebue+rKHhN/Q1ubK76i6ytm/0Tfk5Mc2737fEKNh2rL85pvxm+SNP47PA68qSZ7gni3Hgfk2ZPmsawcymucu3+zs7OI117r2LEte8M9wnp7/GqbTVnnWJxNGz5Hp33hTiv3FcauyforwiGx6V9PtHf9mx33km/7an5H1jRGfTtCdvWcA4AACgY9/TsgIJIuX2KO3xfN/XrLefay9R+y817yLYdHR3HKn+3YrUvznTs2/z+Pqf5Q74YUftWV9gM+nkmDQo2tVcmk3wsq/Gr7RgTxAGFk9Gx58c5zd3uvxnrnqbNtbbmPpi4b9HaNfn5tuYkeJcsKNjWuvMe7q7Bijxrf6P4VPM6/T4mDQo2jV2u/unheB77goEVa9bWvgPJxB/9/kPHvjnsJ1mBujPMAQCAAlFRsMTdsMP4Niy0Qhpbp0LqEm17FH8oepWe7sftpzF0zCeV3239uGCrVquXJvuLqMctn0zyhE37zdScvfGcqaDjblPs1HU+n2QF1sc5c37yP/mh9hZd17Waf6YfV/985Qe0Pcv6ccGm+D3JPt4d0bq22trTSZ6wtbS0HJ24Qng8mr8svI4gf1mcMzre14o/FTv8b8xp7opk/7/7/fE+AADgEKQCYV6aPV2yJ0XrrQjxY8pfmWTFXpe2P7v5Ywo25W/yfU+5vvb29uPCXFiwuTmj4fhU0fXNqdVqx2t7o865oCnnI0VXzKyydiX7geF/C6k0s1CFaIt/4T+nYLPfOZvp90lcwaZt1edMGn0kqvb2cBwAAOCgqZC4wbYqTE5Qe4/Pq+CYn2bvudm7b1/U6/WLNWez2r3aPqDtsHu53l7eHwx+qNZemF8eHN/eWXvWzXtM8ZniPj/+X9O5B+wJnO/rei/0bXuqprFr0uxj2zcUfYrvbc2KUcUG9+WLL9VepZjlvsCwRXGRP477u+zRcb5Lsy9cfPR/+Z8WAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABzi/gYAKUxufTMsKQAAAABJRU5ErkJggg==>