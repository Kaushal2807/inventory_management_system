from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class StockMovementTypeEnum(str, Enum):
    IN = "in"
    OUT = "out"

# User Schemas
class UserLogin(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1)

class UserCreate(BaseModel):
    username: str = Field(..., min_length=1, max_length=50)
    password: str = Field(..., min_length=1)

class UserResponse(BaseModel):
    id: int
    username: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class LoginResponse(BaseModel):
    user: UserResponse
    token: str
    message: str

# Category Schemas
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Category name")
    description: Optional[str] = Field(None, description="Category description")

class CategoryCreate(CategoryBase):
    pass

class CategoryUpdate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Item Schemas
class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200, description="Item name")
    description: Optional[str] = Field(None, description="Item description")
    category_id: int = Field(..., gt=0, description="Category ID")
    purchase_price: float = Field(..., ge=0, description="Purchase price")
    selling_price: float = Field(..., ge=0, description="Selling price")
    quantity: int = Field(..., ge=0, description="Current quantity")
    min_stock_level: Optional[int] = Field(10, ge=0, description="Minimum stock level")

class ItemCreate(ItemBase):
    pass

class ItemUpdate(ItemBase):
    pass

class ItemResponse(ItemBase):
    id: int
    created_at: datetime
    updated_at: datetime
    category: Optional[CategoryResponse] = None
    
    class Config:
        from_attributes = True

# Stock Movement Schemas
class StockMovementBase(BaseModel):
    item_id: int = Field(..., gt=0, description="Item ID")
    movement_type: StockMovementTypeEnum = Field(..., description="Movement type (in/out)")
    quantity: int = Field(..., gt=0, description="Quantity to move")
    reason: Optional[str] = Field(None, max_length=500, description="Reason for stock movement")
    reference_number: Optional[str] = Field(None, max_length=100, description="Reference number")

class StockMovementCreate(StockMovementBase):
    pass

class StockMovementResponse(StockMovementBase):
    id: int
    created_at: datetime
    item: Optional[ItemResponse] = None
    
    class Config:
        from_attributes = True

# Stock Summary Schemas
class StockSummaryItem(BaseModel):
    item_id: int
    item_name: str
    category_name: str
    total_stock: int
    stock_in: int
    stock_out: int
    current_quantity: int

class StockSummaryResponse(BaseModel):
    items: List[StockSummaryItem]
    total_items: int

# Dashboard Schemas
class DashboardStats(BaseModel):
    total_items: int
    total_categories: int
    low_stock_items: int
    total_value: float

# Generic Response Schemas
class MessageResponse(BaseModel):
    message: str
    
class ErrorResponse(BaseModel):
    detail: str

# Payment Schemas
class PaymentItemCreate(BaseModel):
    item_id: int
    quantity: int = Field(..., gt=0, description="Quantity must be greater than 0")

class PaymentItemResponse(BaseModel):
    id: int
    item_id: int
    item_name: str
    quantity: int
    unit_price: float
    total_price: float
    created_at: datetime
    
    class Config:
        from_attributes = True

class PaymentCreate(BaseModel):
    customer_name: str = Field(..., min_length=1, max_length=200, description="Customer name")
    items: List[PaymentItemCreate] = Field(..., min_items=1, description="At least one item is required")
    discount: Optional[float] = Field(0.0, ge=0, description="Discount amount")

class PaymentResponse(BaseModel):
    id: int
    customer_name: str
    subtotal: float
    discount: float
    total_amount: float
    payment_date: datetime
    created_at: datetime
    updated_at: datetime
    payment_items: List[PaymentItemResponse]
    
    class Config:
        from_attributes = True

class PaymentListResponse(BaseModel):
    id: int
    customer_name: str
    total_amount: float
    payment_date: datetime
    items_count: int
    
    class Config:
        from_attributes = True