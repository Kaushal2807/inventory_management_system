from sqlalchemy.orm import Session
from sqlalchemy import desc
from models import Payment, PaymentItem, Item
from schemas import PaymentCreate
from fastapi import HTTPException
from typing import List, Optional

def create_payment(db: Session, payment_data: PaymentCreate) -> Payment:
    """Create a new payment with items and update inventory"""
    
    # Calculate totals and validate items
    subtotal = 0.0
    payment_items_data = []
    
    for item_data in payment_data.items:
        # Get item and validate stock
        item = db.query(Item).filter(Item.id == item_data.item_id).first()
        if not item:
            raise HTTPException(status_code=404, detail=f"Item with id {item_data.item_id} not found")
        
        if item.quantity < item_data.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for {item.name}. Available: {item.quantity}, Requested: {item_data.quantity}"
            )
        
        # Calculate item total
        item_total = item.selling_price * item_data.quantity
        subtotal += item_total
        
        payment_items_data.append({
            'item': item,
            'quantity': item_data.quantity,
            'unit_price': item.selling_price,
            'total_price': item_total
        })
    
    # Calculate final total
    total_amount = subtotal - payment_data.discount
    
    # Create payment record
    db_payment = Payment(
        customer_name=payment_data.customer_name,
        subtotal=subtotal,
        discount=payment_data.discount,
        total_amount=total_amount
    )
    
    db.add(db_payment)
    db.flush()  # Get the payment ID
    
    # Create payment items and update inventory
    for item_info in payment_items_data:
        # Create payment item
        payment_item = PaymentItem(
            payment_id=db_payment.id,
            item_id=item_info['item'].id,
            item_name=item_info['item'].name,
            quantity=item_info['quantity'],
            unit_price=item_info['unit_price'],
            total_price=item_info['total_price']
        )
        db.add(payment_item)
        
        # Update item inventory
        item_info['item'].quantity -= item_info['quantity']
    
    db.commit()
    db.refresh(db_payment)
    
    return db_payment

def get_payment_by_id(db: Session, payment_id: int) -> Optional[Payment]:
    """Get a payment by ID with all related items"""
    return db.query(Payment).filter(Payment.id == payment_id).first()

def get_payments(db: Session, skip: int = 0, limit: int = 100) -> List[Payment]:
    """Get all payments with pagination"""
    return db.query(Payment).order_by(desc(Payment.payment_date)).offset(skip).limit(limit).all()

def get_payments_by_customer(db: Session, customer_name: str, skip: int = 0, limit: int = 100) -> List[Payment]:
    """Get payments by customer name"""
    return (db.query(Payment)
            .filter(Payment.customer_name.ilike(f"%{customer_name}%"))
            .order_by(desc(Payment.payment_date))
            .offset(skip)
            .limit(limit)
            .all())

def delete_payment(db: Session, payment_id: int) -> bool:
    """Delete a payment and restore inventory (if needed)"""
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        return False
    
    # Optionally restore inventory
    # for payment_item in payment.payment_items:
    #     item = db.query(Item).filter(Item.id == payment_item.item_id).first()
    #     if item:
    #         item.quantity += payment_item.quantity
    
    db.delete(payment)
    db.commit()
    return True

def get_payment_stats(db: Session) -> dict:
    """Get payment statistics"""
    from sqlalchemy import func
    
    # Total payments today
    from datetime import datetime, timedelta
    today = datetime.now().date()
    
    total_payments = db.query(Payment).count()
    today_payments = db.query(Payment).filter(
        func.date(Payment.payment_date) == today
    ).count()
    
    # Total revenue
    total_revenue = db.query(func.sum(Payment.total_amount)).scalar() or 0.0
    today_revenue = db.query(func.sum(Payment.total_amount)).filter(
        func.date(Payment.payment_date) == today
    ).scalar() or 0.0
    
    # Top customer by total spending
    top_customer = db.query(
        Payment.customer_name,
        func.sum(Payment.total_amount).label('total_spent')
    ).group_by(Payment.customer_name).order_by(desc('total_spent')).first()
    
    return {
        'total_payments': total_payments,
        'today_payments': today_payments,
        'total_revenue': float(total_revenue),
        'today_revenue': float(today_revenue),
        'top_customer': {
            'name': top_customer[0] if top_customer else None,
            'total_spent': float(top_customer[1]) if top_customer else 0.0
        }
    }