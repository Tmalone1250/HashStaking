// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/mockUSDT.sol";

contract MintTokens is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("WALLET_PRIVATE_KEY");
        address mockUSDTAddress = 0xC4752a9FB06Dc0432831Befca38E071B07cE7BeB; 
        
        vm.startBroadcast(deployerPrivateKey);
        
        mockUSDT token = mockUSDT(mockUSDTAddress);
        // Mint 10,000 USDT (assuming 6 decimals)
        token.mint(msg.sender, 10000 * 1e6);
        
        vm.stopBroadcast();
    }
}