// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title SBTRegistry
 * @dev Stateful compliance registry mapping custody accounts to verification tiers and claims.
 */
contract SBTRegistry is AccessControl {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    mapping(address => bool) private _verifiedClaims;
    mapping(address => uint256) private _verificationTiers;

    event IdentityRegistered(address indexed account, uint256 tier);
    event IdentityRevoked(address indexed account);

    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ISSUER_ROLE, msg.sender);
    }

    function setVerificationStatus(address account, uint256 tier, bool status) external onlyRole(ISSUER_ROLE) {
        require(account != address(0), "Registry: Invalid target address");
        if (status) {
            _verifiedClaims[account] = true;
            _verificationTiers[account] = tier;
            emit IdentityRegistered(account, tier);
        } else {
            _verifiedClaims[account] = false;
            _verificationTiers[account] = 0;
            emit IdentityRevoked(account);
        }
    }

    function hasValidSBT(address account) external view returns (bool) {
        return _verifiedClaims[account];
    }

    function getVerificationTier(address account) external view returns (uint256) {
        return _verificationTiers[account];
    }
}
