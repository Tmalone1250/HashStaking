// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/SBTRegistry.sol";

contract RegisterDemoWallets is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("WALLET_PRIVATE_KEY");
        address sbtRegistryAddress = 0x76a545Ad068173e5B1C111A57d6576926EDa1C77;

        address akiraToriyama = 0xe69324550feC48171a1Aa11Dc9b076144e777dFe; // Issuer
        address satoshiNakamoto = 0x50F9F043500eC3c3FB733B94F2EC27a9030e00EF; // Investor A
        address lilWayne = 0x8D84bcFfc08E9a9C88d64d6680549Ab1919032A0; // Investor B
        // Light Yagami (0x67Ce6b7e6E83c36Eb2CE1709d7cd5a335FB07FF4) intentionally left unverified for demo

        vm.startBroadcast(deployerPrivateKey);

        SBTRegistry registry = SBTRegistry(sbtRegistryAddress);

        // Register Tier 1 institutional verification
        registry.setVerificationStatus(akiraToriyama, 1, true);
        console.log("Registered SBT for Akira Toriyama (Issuer):", akiraToriyama);

        registry.setVerificationStatus(satoshiNakamoto, 1, true);
        console.log("Registered SBT for Satoshi Nakamoto (Investor A):", satoshiNakamoto);

        registry.setVerificationStatus(lilWayne, 1, true);
        console.log("Registered SBT for Lil Wayne (Investor B):", lilWayne);

        vm.stopBroadcast();
    }
}
