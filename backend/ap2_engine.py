"""
AP2 Mandate Engine (ap2_engine.py)
Implements EIP-712 typed data schemas and cryptographic verification for Google AP2 payment mandates.
"""
from typing import Dict, Any, Union
from eth_account import Account
from eth_account.messages import encode_typed_data
from web3 import Web3

# HashKey Chain Testnet Configuration
HASHKEY_TESTNET_RPC = "https://testnet.hsk.xyz"
HASHKEY_TESTNET_CHAIN_ID = 133

# EIP-712 Domain Separator
EIP712_DOMAIN = {
    "name": "HashStaking",
    "version": "1",
    "chainId": HASHKEY_TESTNET_CHAIN_ID,
}

# EIP-712 Types Definition
EIP712_TYPES = {
    "EIP712Domain": [
        {"name": "name", "type": "string"},
        {"name": "version", "type": "string"},
        {"name": "chainId", "type": "uint256"},
    ],
    "PaymentMandate": [
        {"name": "user", "type": "address"},
        {"name": "vault", "type": "address"},
        {"name": "amount", "type": "uint256"},
        {"name": "nonce", "type": "uint256"},
        {"name": "expiration", "type": "uint256"},
    ]
}

def build_mandate_typed_data(mandate_dict: Dict[str, Any], verifying_contract: Union[str, None] = None) -> Dict[str, Any]:
    """
    Constructs the complete EIP-712 typed data payload dictionary for a PaymentMandate.
    """
    domain = EIP712_DOMAIN.copy()
    if verifying_contract and Web3.is_address(verifying_contract):
        domain["verifyingContract"] = Web3.to_checksum_address(verifying_contract)
        types = EIP712_TYPES.copy()
        types["EIP712Domain"].append({"name": "verifyingContract", "type": "address"})
    else:
        types = EIP712_TYPES.copy()

    return {
        "types": types,
        "primaryType": "PaymentMandate",
        "domain": domain,
        "message": {
            "user": Web3.to_checksum_address(mandate_dict["user"]),
            "vault": Web3.to_checksum_address(mandate_dict["vault"]),
            "amount": int(mandate_dict["amount"]),
            "nonce": int(mandate_dict["nonce"]),
            "expiration": int(mandate_dict["expiration"]),
        }
    }

def verify_mandate_signature(mandate_dict: Dict[str, Any], signature_bytes: Union[bytes, str], verifying_contract: Union[str, None] = None) -> bool:
    """
    Validates an EIP-712 cryptographic signature against a PaymentMandate payload.
    Returns True if the recovered signer matches the mandate user address.
    """
    try:
        sig_str = str(signature_bytes)
        typed_data = build_mandate_typed_data(mandate_dict, verifying_contract)
        signable_message = encode_typed_data(full_message=typed_data)
        
        recovered_address = Account.recover_message(signable_message, signature=sig_str)
        expected_user = Web3.to_checksum_address(mandate_dict["user"])
        
        return recovered_address == expected_user
    except Exception as e:
        print(f"[AP2 Engine] Signature verification failed: {e}")
        return False
