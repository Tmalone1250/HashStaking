// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SBTRegistry.sol";

contract SimulateKYC is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("WALLET_PRIVATE_KEY");
        // Use the actual registry address you deployed
        address registryAddress = 0x7AE9a2BdDa9b827483be932a6BE1372867B460c7;
        address myWallet = 0x85F52C53478CD87f571cE18a4a6e43AeBB5DA9D3;

        vm.startBroadcast(deployerPrivateKey);
        
        SBTRegistry registry = SBTRegistry(registryAddress);
        
        // This transaction simulates the KYC approval process
        registry.setVerificationStatus(myWallet, 1, true);
        
        vm.stopBroadcast();
    }
}