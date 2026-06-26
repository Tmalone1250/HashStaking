// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/mockUSDT.sol";
import "../src/SBTRegistry.sol";
import "../src/CompliantYieldVault.sol";

contract DeployHashStaking is Script {
    function run() external returns (mockUSDT token, SBTRegistry registry, CompliantYieldVault vault) {
        uint256 deployerPrivateKey = vm.envOr("PRIVATE_KEY", uint256(0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80));
        address feeTreasury = vm.envOr("FEE_TREASURY", address(0x70997970C51812dc3A010C7d01b50e0d17dc79C8));

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy Staking Token
        token = new mockUSDT();

        // 2. Deploy Compliance Registry
        registry = new SBTRegistry();

        // 3. Deploy Yield Vault
        vault = new CompliantYieldVault(address(token), address(registry), feeTreasury);

        // Confirm link assertions
        require(address(vault.stakingToken()) == address(token), "Deploy: Token link failure");
        require(address(vault.sbtRegistry()) == address(registry), "Deploy: Registry link failure");
        require(vault.feeTreasury() == feeTreasury, "Deploy: Treasury link failure");

        vm.stopBroadcast();
    }
}
