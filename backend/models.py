from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum
from datetime import datetime, timezone, timedelta

# Define IST timezone (UTC + 5:30)
IST = timezone(timedelta(hours=5, minutes=30))

def get_ist_now():
    """Get current time in IST"""
    return datetime.now(IST)

class StockMovementType(enum.Enum):
    IN = "in"
    OUT = "out"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    password = Column(String(100), nullable=False)  # In real app, this should be hashed
    created_at = Column(DateTime(timezone=True), default=get_ist_now)
    updated_at = Column(DateTime(timezone=True), default=get_ist_now, onupdate=get_ist_now)

class Category(Base):
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_ist_now)
    updated_at = Column(DateTime(timezone=True), default=get_ist_now, onupdate=get_ist_now)
    
    # Relationship with items
    items = relationship("Item", back_populates="category", cascade="all, delete-orphan")

class Item(Base):
    __tablename__ = "items"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    purchase_price = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    quantity = Column(Integer, nullable=False, default=0)
    min_stock_level = Column(Integer, nullable=True, default=10)
    created_at = Column(DateTime(timezone=True), default=get_ist_now)
    updated_at = Column(DateTime(timezone=True), default=get_ist_now, onupdate=get_ist_now)
    
    # Relationship with category and stock movements
    category = relationship("Category", back_populates="items")
    stock_movements = relationship("StockMovement", back_populates="item", cascade="all, delete-orphan")

class StockMovement(Base):
    __tablename__ = "stock_movements"
    
    id = Column(Integer, primary_key=True, index=True)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    movement_type = Column(Enum(StockMovementType), nullable=False)
    quantity = Column(Integer, nullable=False)
    reason = Column(String(500), nullable=True)
    reference_number = Column(String(100), nullable=True)
    created_at = Column(DateTime(timezone=True), default=get_ist_now)
    
    # Relationship with item
    item = relationship("Item", back_populates="stock_movements")

class Payment(Base):
    __tablename__ = "payments"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(200), nullable=False, index=True)
    subtotal = Column(Float, nullable=False)
    discount = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False)
    payment_date = Column(DateTime(timezone=True), default=get_ist_now)
    created_at = Column(DateTime(timezone=True), default=get_ist_now)
    updated_at = Column(DateTime(timezone=True), default=get_ist_now, onupdate=get_ist_now)
    
    # Relationship with payment items
    payment_items = relationship("PaymentItem", back_populates="payment", cascade="all, delete-orphan")

class PaymentItem(Base):
    __tablename__ = "payment_items"
    
    id = Column(Integer, primary_key=True, index=True)
    payment_id = Column(Integer, ForeignKey("payments.id"), nullable=False)
    item_id = Column(Integer, ForeignKey("items.id"), nullable=False)
    item_name = Column(String(200), nullable=False)  # Store item name at time of sale
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)  # Store price at time of sale
    total_price = Column(Float, nullable=False)
    created_at = Column(DateTime(timezone=True), default=get_ist_now)
    
    # Relationships
    payment = relationship("Payment", back_populates="payment_items")
    item = relationship("Item")