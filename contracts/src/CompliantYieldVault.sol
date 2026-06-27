// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./mockUSDT.sol";
import "./SBTRegistry.sol";

/**
 * @title CompliantYieldVault
 * @dev Implements gas-efficient O(1) Model B reward debt accounting with strict compliance gating, SafeERC20, and ReentrancyGuard.
 */
contract CompliantYieldVault is AccessControl, ReentrancyGuard {
    using SafeERC20 for mockUSDT;

    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    mockUSDT public immutable stakingToken;
    SBTRegistry public immutable sbtRegistry;

    uint256 public totalStaked;
    uint256 public accRewardPerShare;

    uint256 public lastOracleUpdateTimestamp;
    uint256 public assetValuationUSD;
    uint256 public constant ORACLE_TIMEOUT_WINDOW = 25 hours;

    uint256 public constant PRECISION_FACTOR = 1e12;
    uint256 public constant FEE_BPS = 300; // 3% admin performance fee
    uint256 public constant BPS_MAX = 10000;

    address public feeTreasury;

    struct UserInfo {
        uint256 stakedAmount;
        uint256 rewardDebt;
        uint256 cumulativePaidFees;
    }

    mapping(address => UserInfo) public userInfo;

    event Deposited(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardsHarvested(address indexed user, uint256 rewardAmount, uint256 feePaid);
    event RewardsInjected(uint256 amount);
    event AssetValuationUpdated(uint256 newValuation, uint256 timestamp);

    modifier onlyVerified(address account) {
        require(sbtRegistry.hasValidSBT(account), "Transaction Blocked - Missing Regulatory Identity SBT");
        _;
    }

    modifier priceIsFresh() {
        require(block.timestamp - lastOracleUpdateTimestamp <= ORACLE_TIMEOUT_WINDOW, "Oracle Circuit Breaker: Price feed is stale, operations halted");
        _;
    }

    constructor(address _token, address _registry, address _feeTreasury) {
        require(_token != address(0) && _registry != address(0) && _feeTreasury != address(0), "Init: Zero address detected");
        stakingToken = mockUSDT(_token);
        sbtRegistry = SBTRegistry(_registry);
        feeTreasury = _feeTreasury;

        lastOracleUpdateTimestamp = block.timestamp;
        assetValuationUSD = 100000;

        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
    }

    /**
     * @notice Injects physical PoS yield rewards into the vault and updates the global O(1) accumulator index.
     */
    function injectYieldRewards(uint256 amount) external onlyRole(ADMIN_ROLE) {
        require(amount > 0, "Yield: Amount must be greater than zero");
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        if (totalStaked > 0) {
            accRewardPerShare += (amount * PRECISION_FACTOR) / totalStaked;
            emit RewardsInjected(amount);
        }
    }

    /**
     * @notice Updates the off-chain oracle asset valuation USD baseline and resets the circuit breaker timer.
     */
    function updateAssetValuation(uint256 newValuation) external onlyRole(ADMIN_ROLE) {
        assetValuationUSD = newValuation;
        lastOracleUpdateTimestamp = block.timestamp;
        emit AssetValuationUpdated(newValuation, block.timestamp);
    }

    /**
     * @notice Derives pending yield in O(1) complexity.
     */
    function pendingYield(address _user) external view priceIsFresh returns (uint256) {
        UserInfo storage user = userInfo[_user];
        return ((user.stakedAmount * accRewardPerShare) / PRECISION_FACTOR) - user.rewardDebt;
    }

    /**
     * @notice Compliant deposit endpoint.
     */
    function deposit(uint256 amount) external nonReentrant onlyVerified(msg.sender) priceIsFresh {
        require(amount > 0, "Vault: Deposit amount must be greater than zero");
        UserInfo storage user = userInfo[msg.sender];

        _settlePendingRewards(msg.sender, user);

        user.stakedAmount += amount;
        totalStaked += amount;

        user.rewardDebt = (user.stakedAmount * accRewardPerShare) / PRECISION_FACTOR;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);
        emit Deposited(msg.sender, amount);
    }

    /**
     * @notice Compliant withdrawal endpoint.
     */
    function withdraw(uint256 amount) external nonReentrant onlyVerified(msg.sender) priceIsFresh {
        UserInfo storage user = userInfo[msg.sender];
        require(user.stakedAmount >= amount, "Vault: Insufficient staked balance");

        _settlePendingRewards(msg.sender, user);

        user.stakedAmount -= amount;
        totalStaked -= amount;

        user.rewardDebt = (user.stakedAmount * accRewardPerShare) / PRECISION_FACTOR;

        stakingToken.safeTransfer(msg.sender, amount);
        emit Withdrawn(msg.sender, amount);
    }

    /**
     * @notice Internal O(1) reward settlement pulling physical tokens from vault reserve.
     */
    function _settlePendingRewards(address _user, UserInfo storage user) internal {
        if (user.stakedAmount > 0) {
            uint256 pending = ((user.stakedAmount * accRewardPerShare) / PRECISION_FACTOR) - user.rewardDebt;
            if (pending > 0) {
                uint256 fee = (pending * FEE_BPS) / BPS_MAX;
                uint256 netPayout = pending - fee;

                user.cumulativePaidFees += fee;

                stakingToken.safeTransfer(feeTreasury, fee);
                stakingToken.safeTransfer(_user, netPayout);

                emit RewardsHarvested(_user, netPayout, fee);
            }
        }
    }
}
