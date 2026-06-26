// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/mockUSDT.sol";
import "../src/SBTRegistry.sol";
import "../src/CompliantYieldVault.sol";

contract MaliciousToken is ERC20 {
    address public targetVault;
    bool public attackActive;

    constructor() ERC20("Malicious Token", "MAL") {}

    function setVault(address _vault) external {
        targetVault = _vault;
    }

    function enableAttack() external {
        attackActive = true;
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        if (attackActive && msg.sender == targetVault) {
            // Attempt reentrancy during withdraw
            CompliantYieldVault(targetVault).withdraw(amount);
        }
        return super.transfer(to, amount);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

contract IntegrationFullLifecycleTest is Test {
    mockUSDT public usdt;
    SBTRegistry public registry;
    CompliantYieldVault public vault;

    address public deployer = address(0x100);
    address public treasury = address(0x200);
    address public verifiedUser = address(0x111);
    address public unverifiedUser = address(0x222);

    uint256 constant INIT_BAL = 50000 * 1e6;

    function setUp() public {
        vm.startPrank(deployer);

        // 1. Deploy Token
        usdt = new mockUSDT();

        // 2. Deploy Registry
        registry = new SBTRegistry();

        // 3. Deploy Vault
        vault = new CompliantYieldVault(address(usdt), address(registry), treasury);

        // Authorize admin & issuer roles
        registry.grantRole(registry.ISSUER_ROLE(), deployer);
        vault.grantRole(vault.ADMIN_ROLE(), deployer);

        // Whitelist verified user
        registry.setVerificationStatus(verifiedUser, 1, true);

        // Fund test actors
        usdt.mint(verifiedUser, INIT_BAL);
        usdt.mint(unverifiedUser, INIT_BAL);
        usdt.mint(deployer, INIT_BAL);

        vm.stopPrank();

        // Max approvals
        vm.prank(verifiedUser);
        usdt.approve(address(vault), type(uint256).max);

        vm.prank(unverifiedUser);
        usdt.approve(address(vault), type(uint256).max);

        vm.prank(deployer);
        usdt.approve(address(vault), type(uint256).max);
    }

    // Test Case 1: Registry Compliance Gating
    function test_TestCase1_RegistryCompliance() public {
        assertTrue(registry.hasValidSBT(verifiedUser));
        assertFalse(registry.hasValidSBT(unverifiedUser));

        // Unverified user blocked by exact string gate
        vm.prank(unverifiedUser);
        vm.expectRevert("Transaction Blocked - Missing Regulatory Identity SBT");
        vault.deposit(1000 * 1e6);

        // Verified user successfully deposits
        vm.prank(verifiedUser);
        vault.deposit(1000 * 1e6);
        assertEq(vault.totalStaked(), 1000 * 1e6);
    }

    // Test Case 2: Full Yield Lifecycle & Fee Math
    function test_TestCase2_FullYieldLifecycle() public {
        uint256 depositAmt = 1000 * 1e6;
        uint256 yieldAmt = 100 * 1e6;

        // VerifiedUser deposits 1000 USDT
        vm.prank(verifiedUser);
        vault.deposit(depositAmt);

        // Admin injects 100 USDT as yield
        vm.prank(deployer);
        vault.injectYieldRewards(yieldAmt);

        // Verify pendingYield matches expected values
        uint256 pending = vault.pendingYield(verifiedUser);
        assertEq(pending, yieldAmt);

        // VerifiedUser withdraws principal + yield
        uint256 preBalUser = usdt.balanceOf(verifiedUser);
        uint256 preBalTreasury = usdt.balanceOf(treasury);

        vm.prank(verifiedUser);
        vault.withdraw(depositAmt);

        // 3% admin performance fee on 100 USDT = 3 USDT
        uint256 expectedFee = (yieldAmt * 300) / 10000;
        uint256 expectedNetYield = yieldAmt - expectedFee;

        assertEq(usdt.balanceOf(treasury), preBalTreasury + expectedFee);
        assertEq(usdt.balanceOf(verifiedUser), preBalUser + depositAmt + expectedNetYield);
        assertEq(vault.totalStaked(), 0);
    }

    // Test Case 3: Security Check (ReentrancyGuard Protection)
    function test_TestCase3_SecurityReentrancyCheck() public {
        vm.startPrank(deployer);
        MaliciousToken malToken = new MaliciousToken();
        CompliantYieldVault malVault = new CompliantYieldVault(address(malToken), address(registry), treasury);
        malToken.setVault(address(malVault));
        
        malToken.mint(verifiedUser, 1000 * 1e6);
        vm.stopPrank();

        vm.startPrank(verifiedUser);
        malToken.approve(address(malVault), type(uint256).max);
        malVault.deposit(1000 * 1e6);

        malToken.enableAttack();

        // Expect ReentrancyGuard custom error selector revert
        vm.expectRevert(ReentrancyGuard.ReentrancyGuardReentrantCall.selector);
        malVault.withdraw(500 * 1e6);
        vm.stopPrank();
    }
}
