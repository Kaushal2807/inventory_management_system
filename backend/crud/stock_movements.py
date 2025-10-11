from sqlalchemy.orm import Session
from sqlalchemy import and_, func
from typing import List, Optional
from models import StockMovement, Item, Category, StockMovementType
from schemas import StockMovementCreate, StockSummaryItem

def create_stock_movement(db: Session, stock_movement: StockMovementCreate):
    """Create a new stock movement and update item quantity accordingly"""
    
    # Get the item first
    item = db.query(Item).filter(Item.id == stock_movement.item_id).first()
    if not item:
        raise ValueError("Item not found")
    
    # Create the stock movement record
    db_movement = StockMovement(
        item_id=stock_movement.item_id,
        movement_type=StockMovementType(stock_movement.movement_type),
        quantity=stock_movement.quantity,
        reason=stock_movement.reason,
        reference_number=stock_movement.reference_number
    )
    
    # Update item quantity based on movement type
    if stock_movement.movement_type == "in":
        item.quantity += stock_movement.quantity
    else:  # "out"
        if item.quantity < stock_movement.quantity:
            raise ValueError(f"Insufficient stock. Available: {item.quantity}, Requested: {stock_movement.quantity}")
        item.quantity -= stock_movement.quantity
    
    db.add(db_movement)
    db.commit()
    db.refresh(db_movement)
    db.refresh(item)
    
    return db_movement

def get_stock_movements(db: Session, skip: int = 0, limit: int = 100, item_id: Optional[int] = None):
    """Get stock movements with optional filtering by item_id"""
    query = db.query(StockMovement)
    if item_id:
        query = query.filter(StockMovement.item_id == item_id)
    
    return query.offset(skip).limit(limit).all()

def get_stock_movement(db: Session, movement_id: int):
    """Get a specific stock movement by ID"""
    return db.query(StockMovement).filter(StockMovement.id == movement_id).first()

def get_stock_summary(db: Session):
    """Get stock summary with total, in, and out quantities for all items"""
    
    try:
        # First, get all items with their categories
        items_query = db.query(Item, Category).join(Category, Item.category_id == Category.id).all()
        
        summary_items = []
        for item, category in items_query:
            # Get stock in movements (actual movements only)
            stock_in_movements = db.query(func.coalesce(func.sum(StockMovement.quantity), 0)).filter(
                StockMovement.item_id == item.id,
                StockMovement.movement_type == StockMovementType.IN
            ).scalar() or 0
            
            # Get stock out movements
            stock_out = db.query(func.coalesce(func.sum(StockMovement.quantity), 0)).filter(
                StockMovement.item_id == item.id,
                StockMovement.movement_type == StockMovementType.OUT
            ).scalar() or 0
            
            # Calculate initial quantity (current - net movements)
            net_movements = stock_in_movements - stock_out
            initial_quantity = item.quantity - net_movements
            
            # Total stock in = initial quantity + IN movements
            total_stock_in = initial_quantity + stock_in_movements
            
            # Calculate total stock (net of initial + movements)
            total_stock = total_stock_in - stock_out
            
            summary_items.append(StockSummaryItem(
                item_id=item.id,
                item_name=item.name,
                category_name=category.name,
                total_stock=total_stock,
                stock_in=total_stock_in,
                stock_out=stock_out,
                current_quantity=item.quantity
            ))
        
        return summary_items
    
    except Exception as e:
        print(f"Error in get_stock_summary: {str(e)}")
        raise e

def delete_stock_movement(db: Session, movement_id: int):
    """Delete a stock movement and reverse the quantity change"""
    movement = db.query(StockMovement).filter(StockMovement.id == movement_id).first()
    if not movement:
        return None
    
    # Get the item and reverse the quantity change
    item = db.query(Item).filter(Item.id == movement.item_id).first()
    if item:
        if movement.movement_type == StockMovementType.IN:
            # Reverse the addition
            item.quantity -= movement.quantity
        else:  # OUT
            # Reverse the subtraction
            item.quantity += movement.quantity
        
        # Ensure quantity doesn't go below 0
        if item.quantity < 0:
            item.quantity = 0
    
    db.delete(movement)
    db.commit()
    
    return movement

def get_item_stock_movements(db: Session, item_id: int, skip: int = 0, limit: int = 50):
    """Get stock movements for a specific item"""
    return db.query(StockMovement).filter(
        StockMovement.item_id == item_id
    ).order_by(StockMovement.created_at.desc()).offset(skip).limit(limit).all()