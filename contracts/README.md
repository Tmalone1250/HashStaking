# HashStaking Console - Smart Contracts (`Foundry`)

Institutional-grade, regulatory-compliant staking architecture deployed on **HashKey Chain Mainnet** (Chain ID: `177`). Built with Foundry and OpenZeppelin standards.

## 📜 Deployed Live Contract Addresses (`https://mainnet.hsk.xyz`)
| Contract | Address | Explorer Link |
| :--- | :--- | :--- |
| **`mockUSDT`** | `0xF0e9f136cb74045020671836ee8dC894E2671b59` | [View on HashKey Explorer](https://explorer.hsk.xyz/address/0xF0e9f136cb74045020671836ee8dC894E2671b59) |
| **`SBTRegistry`** | `0x76a545Ad068173e5B1C111A57d6576926EDa1C77` | [View on HashKey Explorer](https://explorer.hsk.xyz/address/0x76a545Ad068173e5B1C111A57d6576926EDa1C77) |
| **`CompliantYieldVault`** | `0x82223DaFAD9233c52718435DA4690DE75aA7EA84` | [View on HashKey Explorer](https://explorer.hsk.xyz/address/0x82223DaFAD9233c52718435DA4690DE75aA7EA84) |

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
