from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas import PaymentCreate, PaymentResponse, PaymentListResponse, MessageResponse
import crud.payments as payment_crud

router = APIRouter(prefix="/payments", tags=["payments"])

@router.post("/", response_model=PaymentResponse)
async def create_payment(
    payment: PaymentCreate,
    db: Session = Depends(get_db)
):
    """Create a new payment and process the sale"""
    try:
        db_payment = payment_crud.create_payment(db=db, payment_data=payment)
        return db_payment
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=List[PaymentListResponse])
async def get_payments(
    skip: int = Query(0, ge=0, description="Number of payments to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of payments to return"),
    customer: Optional[str] = Query(None, description="Filter by customer name"),
    db: Session = Depends(get_db)
):
    """Get all payments with optional customer filter"""
    if customer:
        payments = payment_crud.get_payments_by_customer(
            db=db, customer_name=customer, skip=skip, limit=limit
        )
    else:
        payments = payment_crud.get_payments(db=db, skip=skip, limit=limit)
    
    # Convert to list response format
    return [
        PaymentListResponse(
            id=payment.id,
            customer_name=payment.customer_name,
            total_amount=payment.total_amount,
            payment_date=payment.payment_date,
            items_count=len(payment.payment_items)
        )
        for payment in payments
    ]

@router.get("/{payment_id}", response_model=PaymentResponse)
async def get_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific payment by ID"""
    payment = payment_crud.get_payment_by_id(db=db, payment_id=payment_id)
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return payment

@router.delete("/{payment_id}", response_model=MessageResponse)
async def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db)
):
    """Delete a payment"""
    success = payment_crud.delete_payment(db=db, payment_id=payment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Payment not found")
    return MessageResponse(message="Payment deleted successfully")

@router.get("/stats/summary")
async def get_payment_stats(db: Session = Depends(get_db)):
    """Get payment statistics"""
    stats = payment_crud.get_payment_stats(db=db)
    return stats