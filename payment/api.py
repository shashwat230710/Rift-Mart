"""
api.py
------
AI-Pay Protocol :: Main FastAPI Server
CyberShopper 2000 Hackathon Project

Endpoints:
    GET  /health           -> system health check
    GET  /balance          -> current wallet balance
    POST /wallet/add       -> add funds (testing only)
    POST /payment          -> process a payment, generate receipt
    GET  /receipt/{id}     -> fetch ASCII receipt for a transaction
    GET  /transactions     -> list all transactions (bonus/debug)

Run with:
    uvicorn api:app --host 0.0.0.0 --port 5000 --reload
"""

import asyncio
from datetime import datetime

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field

import wallet
import receipt_generator

# ---------------------------------------------------------------------------
# App setup
# ---------------------------------------------------------------------------

app = FastAPI(
    title="AI-Pay Protocol",
    description="CyberShopper 2000 :: Y2K Payment Module for Autonomous Shopping Agents",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MAX_AMOUNT = 100000  # amount must be strictly less than this


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class PaymentRequest(BaseModel):
    productId: str
    productName: str
    amount: float = Field(..., description="Amount to deduct, must be > 0 and < 100000")
    agentId: str


class PaymentResponse(BaseModel):
    status: str
    transactionId: str
    amount: float
    balanceAfter: float
    receipt: str


class AddFundsRequest(BaseModel):
    amount: float = Field(..., description="Amount to add to wallet, must be > 0")


class AddFundsResponse(BaseModel):
    status: str
    message: str
    balance: float


class BalanceResponse(BaseModel):
    balance: float


class ReceiptResponse(BaseModel):
    transactionId: str
    receipt: str


class HealthResponse(BaseModel):
    status: str
    system: str
    message: str


# ---------------------------------------------------------------------------
# Global error handlers -> consistent {status, error} shape
# ---------------------------------------------------------------------------

@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"status": "ERROR", "error": exc.detail},
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "status": "ERROR",
            "error": "Validation failed",
            "details": exc.errors(),
        },
    )


# ---------------------------------------------------------------------------
# Health check
# ---------------------------------------------------------------------------

@app.get("/health", response_model=HealthResponse)
async def health_check():
    return {
        "status": "ONLINE",
        "system": "AI-Pay Protocol v1.0.0",
        "message": "SYSTEM READY // Y2K COMPLIANT // ALL SYSTEMS NOMINAL",
    }


# ---------------------------------------------------------------------------
# Balance
# ---------------------------------------------------------------------------

@app.get("/balance", response_model=BalanceResponse)
async def get_balance():
    return {"balance": wallet.get_balance()}


# ---------------------------------------------------------------------------
# Add funds (testing helper)
# ---------------------------------------------------------------------------

@app.post("/wallet/add", response_model=AddFundsResponse)
async def add_funds(req: AddFundsRequest):
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount: must be greater than 0")

    new_balance = wallet.add_funds(req.amount)
    return {
        "status": "SUCCESS",
        "message": f"Added Rs. {req.amount:.2f} to wallet",
        "balance": new_balance,
    }


# ---------------------------------------------------------------------------
# Payment processing
# ---------------------------------------------------------------------------

@app.post("/payment", response_model=PaymentResponse)
async def make_payment(req: PaymentRequest):
    # --- Validation ---
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="Invalid amount: must be greater than 0")
    if req.amount >= MAX_AMOUNT:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid amount: must be less than {MAX_AMOUNT}",
        )

    current_balance = wallet.get_balance()
    if current_balance < req.amount:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Insufficient balance: wallet has Rs. {current_balance:.2f}, "
                f"payment requires Rs. {req.amount:.2f}"
            ),
        )

    # --- Simulated processing delay (Y2K modem-speed realism) ---
    await asyncio.sleep(2)

    # --- Process ---
    tx_id = wallet.generate_transaction_id()
    balance_after = wallet.deduct_balance(req.amount)

    transaction = {
        "transactionId": tx_id,
        "productId": req.productId,
        "productName": req.productName,
        "amount": req.amount,
        "agentId": req.agentId,
        "balanceAfter": balance_after,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "status": "SUCCESS",
    }

    # --- Record + receipt ---
    wallet.record_transaction(transaction)
    receipt_text, _ = receipt_generator.generate_receipt(transaction)

    return {
        "status": "SUCCESS",
        "transactionId": tx_id,
        "amount": req.amount,
        "balanceAfter": balance_after,
        "receipt": receipt_text,
    }


# ---------------------------------------------------------------------------
# Receipt lookup
# ---------------------------------------------------------------------------

@app.get("/receipt/{transaction_id}", response_model=ReceiptResponse)
async def get_receipt(transaction_id: str):
    transaction = wallet.get_transaction(transaction_id)
    if transaction is None:
        raise HTTPException(
            status_code=404,
            detail=f"Transaction not found: {transaction_id}",
        )

    receipt_text, _ = receipt_generator.generate_receipt(transaction)
    return {"transactionId": transaction_id, "receipt": receipt_text}


# ---------------------------------------------------------------------------
# Bonus: full transaction history
# ---------------------------------------------------------------------------

@app.get("/transactions")
async def get_all_transactions():
    return wallet.load_transactions()


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("api:app", host="0.0.0.0", port=5000, reload=True)
