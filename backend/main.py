"""
HashStaking Console Backend (main.py)
Asynchronous FastAPI server providing AP2 Mandate verification, KYC onboarding, and real-time SSE Agent Telemetry streaming.
"""
import asyncio
import time
from typing import Dict, Any, AsyncGenerator
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse
from web3 import Web3
import os

from ap2_engine import (
    verify_mandate_signature,
    verify_legacy_mandate_signature,
    AgentPaymentMandateRequest,
    HASHKEY_TESTNET_RPC,
    HASHKEY_TESTNET_CHAIN_ID
)

app = FastAPI(
    title="HashStaking Console API",
    description="Backend services for sovereign AI agent yield management and regulatory KYC SBT compliance.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Web3 provider connection to HashKey Testnet
w3 = Web3(Web3.HTTPProvider(HASHKEY_TESTNET_RPC))

# Telemetry queue
telemetry_queue: asyncio.Queue = asyncio.Queue()

# In-memory demo registry tracking verified institutions & investors
verified_investors: Dict[str, Dict[str, str]] = {
    "0x50f9f043500ec3c3fb733b94f2ec27a9030e00ef": {
        "address": "0x50F9F043500eC3c3FB733B94F2EC27a9030e00EF",
        "full_name": "Satoshi Nakamoto",
        "corporate_entity": "Nakamoto Holdings LLC",
        "jurisdiction": "El Salvador"
    },
    "0x8d84bcffc08e9a9c88d64d6680549ab1919032a0": {
        "address": "0x8D84bcFfc08E9a9C88d64d6680549Ab1919032A0",
        "full_name": "Dwayne Michael Carter Jr.",
        "corporate_entity": "Young Money Entertainment",
        "jurisdiction": "United States"
    },
    "0xe69324550fec48171a1aa11dc9b076144e777dfe": {
        "address": "0xe69324550feC48171a1Aa11Dc9b076144e777dFe",
        "full_name": "Akira Toriyama",
        "corporate_entity": "Bird Studio Corp.",
        "jurisdiction": "Japan"
    }
}

verified_registry: Dict[str, bool] = {
    "0x85f52c53478cd87f571ce18a4a6e43aebb5da9d3": True,
    "0x50f9f043500ec3c3fb733b94f2ec27a9030e00ef": True,
    "0x8d84bcffc08e9a9c88d64d6680549ab1919032a0": True,
    "0xe69324550fec48171a1aa11dc9b076144e777dfe": True
}

class MandateVerificationRequest(BaseModel):
    user: str = Field(..., description="Staker Ethereum address")
    vault: str = Field(..., description="CompliantYieldVault address")
    amount: int = Field(..., description="Token amount in smallest units")
    nonce: int = Field(..., description="Unique replay protection nonce")
    expiration: int = Field(..., description="Unix timestamp expiration")
    signature: str = Field(..., description="Hex encoded EIP-712 signature")

class KYCVerificationRequest(BaseModel):
    address: str = Field(..., description="Staker Ethereum address")
    full_name: str = Field(..., description="Full Legal Name")
    corporate_entity: str = Field(..., description="Corporate Entity Name")
    jurisdiction: str = Field(..., description="Operating Jurisdiction")

class ClaimRequest(BaseModel):
    wallet_address: str = Field(..., description="Target wallet address to receive faucet tokens")

@app.on_event("startup")
async def startup_event():
    await telemetry_queue.put({
        "agent": "AP2_Mandate_Engine",
        "status": "ONLINE",
        "rpc": HASHKEY_TESTNET_RPC,
        "chain_id": HASHKEY_TESTNET_CHAIN_ID,
        "connected": w3.is_connected()
    })

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "chain_id": HASHKEY_TESTNET_CHAIN_ID,
        "rpc_connected": w3.is_connected()
    }

@app.get("/api/v1/registry/investors")
async def get_verified_investors():
    return list(verified_investors.values())

@app.get("/api/v1/registry/check-status")
async def check_registry_status(address: str):
    addr_clean = address.lower()
    if addr_clean == "0x67ce6b7e6e83c36eb2ce1709d7cd5a335fb07ff4":
        return {"isVerified": False}
    return {"isVerified": verified_registry.get(addr_clean, False) or addr_clean in verified_investors}

SBT_REGISTRY_ADDR = os.getenv("SBT_REGISTRY_ADDRESS", "0x76a545Ad068173e5B1C111A57d6576926EDa1C77")
SBT_ISSUE_ABI = [{
    "inputs": [{"name": "account", "type": "address"}, {"name": "tier", "type": "uint256"}, {"name": "status", "type": "bool"}],
    "name": "setVerificationStatus",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
}]

@app.post("/api/v1/registry/verify")
async def verify_registry_user(payload: KYCVerificationRequest):
    addr_clean = payload.address.lower()
    if addr_clean == "0x67ce6b7e6e83c36eb2ce1709d7cd5a335fb07ff4" or "light yagami" in payload.full_name.lower():
        raise HTTPException(status_code=403, detail="Compliance Gate Rejection: Sanctioned / Blacklisted Entity. Identity SBT issuance denied.")
    verified_registry[addr_clean] = True
    verified_investors[addr_clean] = {
        "address": Web3.to_checksum_address(payload.address),
        "full_name": payload.full_name,
        "corporate_entity": payload.corporate_entity,
        "jurisdiction": payload.jurisdiction
    }
    tx_hash_hex = "0x"
    try:
        pk = os.getenv("WALLET_PRIVATE_KEY", "0x1dc25f78f7c2bfd04d7272e3f4b7c223cc0d6a95c9c8508c1709778d84b2fed6")
        account = w3.eth.account.from_key(pk)
        reg_contract = w3.eth.contract(address=Web3.to_checksum_address(SBT_REGISTRY_ADDR), abi=SBT_ISSUE_ABI)
        target_addr = Web3.to_checksum_address(payload.address)
        
        nonce = w3.eth.get_transaction_count(account.address, "pending")
        tx = reg_contract.functions.setVerificationStatus(target_addr, 1, True).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 200000,
            'gasPrice': w3.eth.gas_price,
            'chainId': HASHKEY_TESTNET_CHAIN_ID
        })
        signed_tx = w3.eth.account.sign_transaction(tx, private_key=pk)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        tx_hash_hex = w3.to_hex(tx_hash)
        
        await telemetry_queue.put({
            "agent": "KYC_Onboarding_Agent",
            "level": "INFO",
            "message": f"Institutional compliance verified for {payload.corporate_entity} ({payload.jurisdiction}) - On-Chain SBT Identity Minted (Tx: {tx_hash_hex})."
        })
    except Exception as e:
        await telemetry_queue.put({
            "agent": "KYC_Onboarding_Agent",
            "level": "WARNING",
            "message": f"On-chain SBT minting fallback: {str(e)}"
        })

    return {"success": True, "isVerified": True, "entity": payload.corporate_entity, "address": payload.address, "tx_hash": tx_hash_hex}

USDT_CONTRACT_ADDR = os.getenv("MOCK_USDT_ADDRESS", "0x7AE9a2BdDa9b827483be932a6BE1372867B460c7")
USDT_MINT_ABI = [{
    "constant": False,
    "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}],
    "name": "mint",
    "outputs": [],
    "payable": False,
    "stateMutability": "nonpayable",
    "type": "function"
}]

@app.post("/api/v1/faucet/claim")
async def claim_mock_usdt(request: ClaimRequest):
    target_wallet = request.wallet_address
    try:
        pk = "0xff3c8594e09146bc50fd0f47760b5ceb170a5a39475595428f7d938a9a7d9cba"
        account = w3.eth.account.from_key(pk)
        
        contract = w3.eth.contract(address=Web3.to_checksum_address(USDT_CONTRACT_ADDR), abi=USDT_MINT_ABI)
        target_addr = Web3.to_checksum_address(target_wallet)
        amount = 1000 * 10**6
        
        nonce = w3.eth.get_transaction_count(account.address, "pending")
        tx = contract.functions.mint(target_addr, amount).build_transaction({
            'from': account.address,
            'nonce': nonce,
            'gas': 150000,
            'gasPrice': w3.eth.gas_price,
            'chainId': HASHKEY_TESTNET_CHAIN_ID
        })
        
        signed_tx = w3.eth.account.sign_transaction(tx, private_key=pk)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.raw_transaction)
        
        await telemetry_queue.put({
            "agent": "Faucet_Dispenser_Agent",
            "level": "INFO",
            "message": f"Dispatched +1,000 testnet USDT faucet allotment to {target_wallet} (Tx: {w3.to_hex(tx_hash)})"
        })
        
        return {"status": "success", "message": f"Minted 1000 mockUSDT to {target_wallet}", "tx_hash": w3.to_hex(tx_hash)}
    except Exception as e:
        await telemetry_queue.put({
            "agent": "Faucet_Dispenser_Agent",
            "level": "WARNING",
            "message": f"Faucet claim failed for {target_wallet}: {str(e)}"
        })
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/mandate/verify")
async def verify_mandate(payload: MandateVerificationRequest):
    # Temporal validation (expiration check)
    current_time = int(time.time())
    if payload.expiration <= current_time:
        await telemetry_queue.put({
            "agent": "Compliance_Gate",
            "level": "WARNING",
            "message": f"Mandate rejected for user {payload.user} (Expired)"
        })
        raise HTTPException(status_code=400, detail="Mandate has expired")

    mandate_data = {
        "user": payload.user,
        "vault": payload.vault,
        "amount": payload.amount,
        "nonce": payload.nonce,
        "expiration": payload.expiration
    }
    
    sig_str = str(payload.signature)
    is_valid = verify_legacy_mandate_signature(mandate_data, sig_str, verifying_contract=payload.vault)
    if not is_valid:
        await telemetry_queue.put({
            "agent": "Compliance_Gate",
            "level": "WARNING",
            "message": f"Mandate rejected for user {payload.user} (Invalid EIP-712 Signature)"
        })
        raise HTTPException(status_code=401, detail="Invalid EIP-712 Mandate Signature")

    await telemetry_queue.put({
        "agent": "Mandate_Execution_Agent",
        "level": "INFO",
        "message": f"Mandate verified for {payload.user}: {payload.amount} units to vault {payload.vault}"
    })
    
    return {"verified": True, "user": payload.user, "vault": payload.vault}

@app.post("/api/v1/mandates/verify")
async def verify_ap2_mandate(request: AgentPaymentMandateRequest):
    if not verify_mandate_signature(request):
        raise HTTPException(status_code=401, detail="Invalid EIP-712 Mandate Signature")
    return {"status": "success", "agentId": request.message.agentId, "userAddress": request.message.userAddress}

@app.get("/api/v1/telemetry/stream")
async def telemetry_stream(request: Request):
    """
    Server-Sent Events (SSE) endpoint streaming real-time agent execution logs and telemetry to frontend console.
    """
    async def event_generator() -> AsyncGenerator[Dict[str, Any], None]:
        while True:
            if await request.is_disconnected():
                break
            try:
                event_data = await asyncio.wait_for(telemetry_queue.get(), timeout=15.0)
                yield {"event": "telemetry", "data": str(event_data)}
            except asyncio.TimeoutError:
                yield {"event": "ping", "data": "keepalive"}
            await asyncio.sleep(0.1)

    return EventSourceResponse(event_generator())
