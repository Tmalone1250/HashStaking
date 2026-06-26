// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/mockUSDT.sol";
import "../src/SBTRegistry.sol";
import "../src/CompliantYieldVault.sol";

contract DeployHashStaking is Script {
    function run() external returns (mockUSDT token, SBTRegistry registry, CompliantYieldVault vault) {
        uint256 deployerPrivateKey = vm.envUint("WALLET_PRIVATE_KEY");
        address feeTreasury = address(0x85F52C53478CD87f571cE18a4a6e43AeBB5DA9D3);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Step A: Deploy mockUSDT
        token = new mockUSDT();

        // 2. Step B: Deploy SBTRegistry
        registry = new SBTRegistry();

        // 3. Step C: Deploy CompliantYieldVault
        vault = new CompliantYieldVault(address(token), address(registry), feeTreasury);

        // Assert link integrity
        require(address(vault.stakingToken()) == address(token), "Deploy: Token link failure");
        require(address(vault.sbtRegistry()) == address(registry), "Deploy: Registry link failure");
        require(vault.feeTreasury() == feeTreasury, "Deploy: Treasury link failure");

        vm.stopBroadcast();
    }
}
