// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/mockUSDT.sol";
import "../src/SBTRegistry.sol";
import "../src/CompliantYieldVault.sol";

contract DeployHashStaking is Script {
    function run() external returns (mockUSDT token, SBTRegistry registry, CompliantYieldVault vault) {
        uint256 deployerPrivateKey = vm.envUint("WALLET_PRIVATE_KEY");
        address deployerAddr = vm.addr(deployerPrivateKey);
        address feeTreasury = deployerAddr;

        vm.startBroadcast(deployerPrivateKey);

        // 1. Step A: Deploy mockUSDT
        token = new mockUSDT();
        console.log("Deployed new mockUSDT at:", address(token));

        // 2. Step B: Deploy SBTRegistry
        registry = new SBTRegistry();
        console.log("Deployed new SBTRegistry at:", address(registry));

        // 3. Step C: Deploy CompliantYieldVault
        vault = new CompliantYieldVault(address(token), address(registry), feeTreasury);
        console.log("Deployed new CompliantYieldVault at:", address(vault));

        // Assert link integrity
        require(address(vault.stakingToken()) == address(token), "Deploy: Token link failure");
        require(address(vault.sbtRegistry()) == address(registry), "Deploy: Registry link failure");
        require(vault.feeTreasury() == feeTreasury, "Deploy: Treasury link failure");

        vm.stopBroadcast();
    }
}
