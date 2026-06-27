from typing import Dict, Any
from eth_account import Account
try:
    from eth_account.messages import encode_structured_data
except ImportError:
    from eth_account.messages import encode_typed_data
    def encode_structured_data(structured_data: Dict[str, Any]):
        return encode_typed_data(full_message=structured_data)

from app.schemas.mandate import AgentPaymentMandateRequest


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
        "domain": {
            "name": request.domain.name,
            "version": request.domain.version,
            "chainId": request.domain.chainId,
            "verifyingContract": request.domain.verifyingContract
        },
        "message": {
            "agentId": request.message.agentId,
            "userAddress": request.message.userAddress,
            "vaultAddress": request.message.vaultAddress,
            "maxAmountLimit": request.message.maxAmountLimit,
            "expirationTimestamp": request.message.expirationTimestamp,
            "nonce": request.message.nonce
        }
    }

    try:
        encoded_data = encode_structured_data(structured_data)
        recovered_address = Account.recover_message(encoded_data, signature=request.signature)
        return recovered_address.lower() == request.message.userAddress.lower()
    except Exception:
        return False
