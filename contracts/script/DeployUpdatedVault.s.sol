// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/CompliantYieldVault.sol";

contract DeployUpdatedVault is Script {
    function run() external returns (CompliantYieldVault vault) {
        uint256 deployerPrivateKey = vm.envUint("WALLET_PRIVATE_KEY");
        address feeTreasury = address(0x85F52C53478CD87f571cE18a4a6e43AeBB5DA9D3);
        address existingToken = address(0xC4752a9FB06Dc0432831Befca38E071B07cE7BeB);
        address existingRegistry = address(0x7AE9a2BdDa9b827483be932a6BE1372867B460c7);

        vm.startBroadcast(deployerPrivateKey);

        vault = new CompliantYieldVault(existingToken, existingRegistry, feeTreasury);

        require(address(vault.stakingToken()) == existingToken, "Deploy: Token link failure");
        require(address(vault.sbtRegistry()) == existingRegistry, "Deploy: Registry link failure");
        require(vault.feeTreasury() == feeTreasury, "Deploy: Treasury link failure");

        vm.stopBroadcast();
    }
}
