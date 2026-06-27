"""
AP2 Mandate Engine (ap2_engine.py)
Implements EIP-712 typed data schemas and cryptographic verification for Google AP2 payment mandates.
"""
import re
from datetime import datetime, timezone
from typing import Dict, Any, Union
from pydantic import BaseModel, Field, field_validator
from eth_account import Account
try:
    from eth_account.messages import encode_structured_data
except ImportError:
    from eth_account.messages import encode_typed_data
    def encode_structured_data(structured_data: Dict[str, Any]):
        return encode_typed_data(full_message=structured_data)
from web3 import Web3

import os

# HashKey Chain Mainnet Configuration
HASHKEY_TESTNET_RPC = os.getenv("HASHKEY_RPC_URL", "https://mainnet.hsk.xyz")
HASHKEY_TESTNET_CHAIN_ID = int(os.getenv("HASHKEY_CHAIN_ID", 177))


EVM_ADDRESS_REGEX = re.compile(r"^0x[a-fA-F0-9]{40}$")
SIGNATURE_REGEX = re.compile(r"^0x[a-fA-F0-9]{130}$")

class EIP712Domain(BaseModel):
    name: str = Field(..., description="The name of the signing domain")
    version: str = Field(..., description="The current security version")
    chainId: int = Field(..., description="The target EVM Chain ID")
    verifyingContract: str = Field(..., description="The verification smart contract address")

    @field_validator("verifyingContract")
    @classmethod
    def validate_evm_address(cls, value: str) -> str:
        if not EVM_ADDRESS_REGEX.match(value):
            raise ValueError("Invalid contract verification target format.")
        return value

class PaymentMandateMessage(BaseModel):
    agentId: str
    userAddress: str
    vaultAddress: str
    maxAmountLimit: int
    expirationTimestamp: int
    nonce: int

    @field_validator("userAddress", "vaultAddress")
    @classmethod
    def validate_addresses(cls, value: str) -> str:
        if not EVM_ADDRESS_REGEX.match(value):
            raise ValueError("Provided string is not a valid EVM address.")
        return value

class AgentPaymentMandateRequest(BaseModel):
    domain: EIP712Domain
    message: PaymentMandateMessage
    signature: str

    @field_validator("signature")
    @classmethod
    def validate_signature_hex(cls, value: str) -> str:
        if not SIGNATURE_REGEX.match(value):
            raise ValueError("Malformed signature format.")
        return value

def verify_mandate_signature(request: AgentPaymentMandateRequest) -> bool:
    structured_data = {
        "types": {
            "EIP712Domain": [
                {"name": "name", "type": "string"},
                {"name": "version", "type": "string"},
                {"name": "chainId", "type": "uint256"},
                {"name": "verifyingContract", "type": "address"}
            ],
            "PaymentMandateMessage": [
                {"name": "agentId", "type": "string"},
                {"name": "userAddress", "type": "address"},
                {"name": "vaultAddress", "type": "address"},
                {"name": "maxAmountLimit", "type": "uint256"},
                {"name": "expirationTimestamp", "type": "uint256"},
                {"name": "nonce", "type": "uint256"}
            ]
        },
        "primaryType": "PaymentMandateMessage",
        "domain": request.domain.dict(),
        "message": request.message.dict()
    }
    
    try:
        encoded_data = encode_structured_data(structured_data)
        recovered_address = Account.recover_message(encoded_data, signature=request.signature)
        return recovered_address.lower() == request.message.userAddress.lower()
    except Exception:
        return False


# --- Legacy / Phase 1 Compatibility Definitions ---
EIP712_DOMAIN = {
    "name": "HashStaking",
    "version": "1",
    "chainId": HASHKEY_TESTNET_CHAIN_ID,
}

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

def verify_legacy_mandate_signature(mandate_dict: Dict[str, Any], signature_bytes: Union[bytes, str], verifying_contract: Union[str, None] = None) -> bool:
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
