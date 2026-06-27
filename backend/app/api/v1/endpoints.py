from fastapi import APIRouter, HTTPException, status
from app.schemas.mandate import AgentPaymentMandateRequest
from app.core.security import verify_mandate_signature

router = APIRouter()


@router.post("/verify")
async def verify_mandate(request: AgentPaymentMandateRequest):
    is_valid = verify_mandate_signature(request)
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Cryptographic mandate verification failed: Invalid signature."
        )
    return {
        "status": "success",
        "message": "Authorization verified successfully.",
        "agentId": request.message.agentId,
        "userAddress": request.message.userAddress
    }
