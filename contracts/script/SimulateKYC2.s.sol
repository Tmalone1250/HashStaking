// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/SBTRegistry.sol";


// contracts/script/BulkVerify.s.sol
contract BulkVerify is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("WALLET_PRIVATE_KEY");
        address registryAddress = 0x7AE9a2BdDa9b827483be932a6BE1372867B460c7;
        
        // Add your Wallet B and Wallet C addresses here
        address[] memory users = new address[](2);
        users[0] = 0x50F9F043500eC3c3FB733B94F2EC27a9030e00EF;
        users[1] = 0x8D84bcFfc08E9a9C88d64d6680549Ab1919032A0;

        vm.startBroadcast(deployerPrivateKey);
        SBTRegistry registry = SBTRegistry(registryAddress);
        
        for (uint i = 0; i < users.length; i++) {
            registry.setVerificationStatus(users[i], 1, true);
        }
        vm.stopBroadcast();
    }
}