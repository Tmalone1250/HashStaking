// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/mockUSDT.sol";

contract MintVIPs is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("WALLET_PRIVATE_KEY");
        address mockUSDTAddress = 0xF0e9f136cb74045020671836ee8dC894E2671b59;

        address[4] memory vips = [
            0x8D84bcFfc08E9a9C88d64d6680549Ab1919032A0, // Lil Wayne
            0x50F9F043500eC3c3FB733B94F2EC27a9030e00EF, // Satoshi Nakamoto
            0xe69324550feC48171a1Aa11Dc9b076144e777dFe, // Akira Toriyama
            0x67Ce6b7e6E83c36Eb2CE1709d7cd5a335FB07FF4  // Light Yagami
        ];

        string[4] memory names = [
            "Lil Wayne",
            "Satoshi Nakamoto",
            "Akira Toriyama",
            "Light Yagami"
        ];

        vm.startBroadcast(deployerPrivateKey);

        mockUSDT token = mockUSDT(mockUSDTAddress);
        uint256 mintAmount = 25000 * 1e6; // 25,000 USDT each

        for (uint256 i = 0; i < vips.length; i++) {
            token.mint(vips[i], mintAmount);
            console.log("Minted 25,000 mockUSDT to:", names[i], vips[i]);
        }

        vm.stopBroadcast();
    }
}
