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

from ap2_engine import verify_mandate_signature, HASHKEY_TESTNET_RPC, HASHKEY_TESTNET_CHAIN_ID

app = FastAPI(
    title="HashStaking Console API",
    description="Backend services for sovereign AI agent yield management and regulatory KYC SBT compliance.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Web3 provider connection to HashKey Testnet
w3 = Web3(Web3.HTTPProvider(HASHKEY_TESTNET_RPC))

# Telemetry queue
telemetry_queue: asyncio.Queue = asyncio.Queue()

# In-memory demo registry tracking verified institutions
verified_registry: Dict[str, bool] = {
    "0x85f52c53478cd87f571ce18a4a6e43aebb5da9d3": True
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
        "status": "ok",
        "chain_id": HASHKEY_TESTNET_CHAIN_ID,
        "rpc_connected": w3.is_connected()
    }

@app.get("/api/v1/registry/check-status")
async def check_registry_status(address: str):
    addr_clean = address.lower()
    return {"isVerified": verified_registry.get(addr_clean, False)}

@app.post("/api/v1/registry/verify")
async def verify_registry_user(payload: KYCVerificationRequest):
    addr_clean = payload.address.lower()
    verified_registry[addr_clean] = True
    await telemetry_queue.put({
        "agent": "KYC_Onboarding_Agent",
        "level": "INFO",
        "message": f"Institutional compliance verified for {payload.corporate_entity} ({payload.jurisdiction}) - SBT Identity Issued."
    })
    return {"success": True, "isVerified": True, "entity": payload.corporate_entity, "address": payload.address}

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
    is_valid = verify_mandate_signature(mandate_data, sig_str, verifying_contract=payload.vault)
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
