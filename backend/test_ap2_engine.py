import time
from fastapi.testclient import TestClient
from eth_account import Account
from eth_account.messages import encode_typed_data
from main import app
from ap2_engine import build_mandate_typed_data

client = TestClient(app)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["chain_id"] == 133

def test_expired_mandate_rejection():
    expired_time = int(time.time()) - 3600
    payload = {
        "user": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "vault": "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
        "amount": 1000000,
        "nonce": 1,
        "expiration": expired_time,
        "signature": "0x1234"
    }
    response = client.post("/api/v1/mandate/verify", json=payload)
    assert response.status_code == 400
    assert response.json()["detail"] == "Mandate has expired"

def test_valid_mandate_verification():
    account = Account.create()
    vault_addr = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC"
    future_time = int(time.time()) + 3600
    
    mandate_dict = {
        "user": account.address,
        "vault": vault_addr,
        "amount": 5000000,
        "nonce": 42,
        "expiration": future_time
    }
    
    typed_data = build_mandate_typed_data(mandate_dict, verifying_contract=vault_addr)
    signable_message = encode_typed_data(full_message=typed_data)
    signed_msg = account.sign_message(signable_message)
    
    payload = mandate_dict.copy()
    payload["signature"] = signed_msg.signature.hex()
    
    response = client.post("/api/v1/mandate/verify", json=payload)
    assert response.status_code == 200
    assert response.json()["verified"] is True
