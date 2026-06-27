from fastapi import FastAPI
from app.api.v1.router import api_router

app = FastAPI(title="HashStaking AP2 Mandate Engine")

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
def health_check():
    return {"status": "API is operational"}
