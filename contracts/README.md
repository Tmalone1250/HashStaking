# HashStaking Console - Smart Contracts (`Foundry`)

Institutional-grade, regulatory-compliant staking architecture deployed on **HashKey Chain Testnet** (Chain ID: `133`). Built with Foundry and OpenZeppelin standards.

## 📜 Deployed Live Contract Addresses (`https://testnet.hsk.xyz`)
| Contract | Address | Explorer Link |
| :--- | :--- | :--- |
| **`CompliantYieldVault`** | `0x71EF9Eb25B5e3C53f9467755b2D66F5ebF455d25` | [View on HashKey Explorer](https://testnet.hsk.xyz/address/0x71EF9Eb25B5e3C53f9467755b2D66F5ebF455d25) |
| **`SBTRegistry`** | `0x7AE9a2BdDa9b827483be932a6BE1372867B460c7` | [View on HashKey Explorer](https://testnet.hsk.xyz/address/0x7AE9a2BdDa9b827483be932a6BE1372867B460c7) |
| **`mockUSDT`** | `0xC4752a9FB06Dc0432831Befca38E071B07cE7BeB` | [View on HashKey Explorer](https://testnet.hsk.xyz/address/0xC4752a9FB06Dc0432831Befca38E071B07cE7BeB) |

## 🏗️ Core Smart Contract Architecture
* **`CompliantYieldVault.sol`**: The primary yield management engine. Features:
  * **On-Chain Compliance Gate**: Modifier `onlyVerified` calls `SBTRegistry.isVerified()` to block unverified wallets with `'Transaction Blocked - Missing Regulatory Identity SBT'`.
  * **Oracle Freshness Circuit Breaker**: Modifier `priceIsFresh()` halts operations if the off-chain property valuation feed is older than 25 hours (`ORACLE_TIMEOUT_WINDOW`).
  * **OpenZeppelin Pausable Control**: Global emergency pause switch locking hot operational paths (`deposit`, `withdraw`, `injectYieldRewards`).
  * **Emergency Wind-Down Exemption**: Administrative flag `isAssetWindDownActive` combined with `emergencyWithdraw()` allows investors to pull out 100% principal even when the vault is paused during security or liquidation events.
  * **Zero-Pool Division Protection & Dust Skimmer**: Safe reward accounting protecting against division panics when `totalStaked == 0`, and admin function `skimDust` to extract trailing token dust.
* **`SBTRegistry.sol`**: Decentralized, soul-bound token identity registry acting as the single source of truth for institutional compliance.
* **`mockUSDT.sol`**: 6-decimal ERC-20 token simulating real-world pegged stablecoin liquidity.

## 🧪 Testing & Deployment Commands
```bash
# Run full Foundry unit test suite
forge test -vvv

# Compile contracts
forge build

# Deploy updated vault script to HashKey Testnet
forge script script/DeployUpdatedVault.s.sol:DeployUpdatedVault --rpc-url https://testnet.hsk.xyz --broadcast --legacy
```
