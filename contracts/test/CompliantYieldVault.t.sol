// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/mockUSDT.sol";
import "../src/SBTRegistry.sol";
import "../src/CompliantYieldVault.sol";

contract CompliantYieldVaultTest is Test {
    mockUSDT public token;
    SBTRegistry public registry;
    CompliantYieldVault public vault;

    address public admin = address(0x1);
    address public treasury = address(0x2);
    address public walletA = address(0xA); // Verified
    address public walletB = address(0xB); // Unverified

    uint256 constant INITIAL_BALANCE = 10000 * 1e6;

    function setUp() public {
        vm.startPrank(admin);

        token = new mockUSDT();
        registry = new SBTRegistry();
        vault = new CompliantYieldVault(address(token), address(registry), treasury);

        // Authorize roles
        registry.grantRole(registry.ISSUER_ROLE(), admin);
        vault.grantRole(vault.ADMIN_ROLE(), admin);

        // Verify Wallet A (Tier 3 clearance)
        registry.setVerificationStatus(walletA, 3, true);

        // Fund accounts
        token.mint(walletA, INITIAL_BALANCE);
        token.mint(walletB, INITIAL_BALANCE);
        token.mint(admin, INITIAL_BALANCE);

        // Approvals
        vm.stopPrank();

        vm.prank(walletA);
        token.approve(address(vault), type(uint256).max);

        vm.prank(walletB);
        token.approve(address(vault), type(uint256).max);

        vm.prank(admin);
        token.approve(address(vault), type(uint256).max);
    }

    function test_RevertWhen_UnverifiedUserDeposits() public {
        vm.prank(walletB);
        vm.expectRevert("Transaction Blocked - Missing Regulatory Identity SBT");
        vault.deposit(100 * 1e6);
    }

    function test_RevertWhen_UnverifiedUserWithdraws() public {
        vm.prank(walletB);
        vm.expectRevert("Transaction Blocked - Missing Regulatory Identity SBT");
        vault.withdraw(100 * 1e6);
    }

    function test_VerifiedUserDepositAndAccrueYield() public {
        uint256 depositAmount = 1000 * 1e6;
        uint256 yieldAmount = 100 * 1e6;

        // Wallet A deposits
        vm.prank(walletA);
        vault.deposit(depositAmount);

        assertEq(vault.totalStaked(), depositAmount);
        assertEq(token.balanceOf(address(vault)), depositAmount);

        // Admin injects yield
        vm.prank(admin);
        vault.injectYieldRewards(yieldAmount);

        // Check pending yield O(1) derivation
        uint256 pending = vault.pendingYield(walletA);
        assertEq(pending, yieldAmount);

        // Wallet A withdraws half principal + harvests yield
        uint256 withdrawAmount = 500 * 1e6;
        uint256 preBalanceA = token.balanceOf(walletA);

        vm.prank(walletA);
        vault.withdraw(withdrawAmount);

        // Fee calculation: 3% of 100e6 = 3e6
        uint256 expectedFee = (yieldAmount * 300) / 10000;
        uint256 expectedNetReward = yieldAmount - expectedFee;

        assertEq(token.balanceOf(treasury), expectedFee);
        assertEq(token.balanceOf(walletA), preBalanceA + withdrawAmount + expectedNetReward);
    }

    function test_ZeroLoopGasMetrics() public {
        // Benchmark deposit gas
        vm.prank(walletA);
        uint256 gasBeforeDeposit = gasleft();
        vault.deposit(1000 * 1e6);
        uint256 gasUsedDeposit = gasBeforeDeposit - gasleft();

        emit log_named_uint("Deposit Gas Consumption", gasUsedDeposit);

        // Inject yield
        vm.prank(admin);
        vault.injectYieldRewards(100 * 1e6);

        // Benchmark withdraw & harvest gas
        vm.prank(walletA);
        uint256 gasBeforeWithdraw = gasleft();
        vault.withdraw(500 * 1e6);
        uint256 gasUsedWithdraw = gasBeforeWithdraw - gasleft();

        emit log_named_uint("Withdraw & Claim Gas Consumption", gasUsedWithdraw);
    }

    function test_OracleCircuitBreaker() public {
        uint256 depositAmount = 500 * 1e6;

        // Advance EVM timestamp past 25-hour timeout window
        vm.warp(block.timestamp + 25 hours + 1 seconds);

        // Verify deposit is halted
        vm.prank(walletA);
        vm.expectRevert("Oracle Circuit Breaker: Price feed is stale, operations halted");
        vault.deposit(depositAmount);

        // Verify pendingYield query is halted
        vm.expectRevert("Oracle Circuit Breaker: Price feed is stale, operations halted");
        vault.pendingYield(walletA);

        // Admin updates oracle valuation baseline
        vm.prank(admin);
        vault.updateAssetValuation(125000);

        assertEq(vault.assetValuationUSD(), 125000);
        assertEq(vault.lastOracleUpdateTimestamp(), block.timestamp);

        // Verify deposit now executes cleanly
        vm.prank(walletA);
        vault.deposit(depositAmount);
        assertEq(vault.totalStaked(), depositAmount);
    }

    function test_EmergencyWindDownWithdraw() public {
        uint256 depositAmount = 1000 * 1e6;

        // Wallet A deposits principal
        vm.prank(walletA);
        vault.deposit(depositAmount);

        // Advance EVM timestamp past 25-hour timeout window so oracle becomes stale
        vm.warp(block.timestamp + 30 hours);

        // Verify standard withdraw reverts due to stale oracle
        vm.prank(walletA);
        vm.expectRevert("Oracle Circuit Breaker: Price feed is stale, operations halted");
        vault.withdraw(500 * 1e6);

        // Verify emergencyWithdraw reverts while emergency mode is disabled
        vm.prank(walletA);
        vm.expectRevert("Emergency Wind-Down mode is not active");
        vault.emergencyWithdraw();

        // Admin activates emergency wind-down mode
        vm.prank(admin);
        vault.toggleAssetWindDown(true);
        assertTrue(vault.isAssetWindDownActive());

        uint256 preBalanceA = token.balanceOf(walletA);

        // Wallet A executes emergency withdrawal bypassing oracle freshness and reward iterations
        vm.prank(walletA);
        vault.emergencyWithdraw();

        // Verify exact principal extracted and global state updated
        assertEq(token.balanceOf(walletA), preBalanceA + depositAmount);
        assertEq(vault.totalStaked(), 0);

        (uint256 stakedAmount, uint256 rewardDebt, ) = vault.userInfo(walletA);
        assertEq(stakedAmount, 0);
        assertEq(rewardDebt, 0);
    }
}
