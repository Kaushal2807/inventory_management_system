from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from schemas import (
    StockMovementCreate, 
    StockMovementResponse, 
    StockSummaryResponse,
    MessageResponse,
    ErrorResponse
)
from crud import stock_movements

router = APIRouter()

@router.post("/stock-movements/", response_model=StockMovementResponse)
def create_stock_movement(
    movement: StockMovementCreate,
    db: Session = Depends(get_db)
):
    """Create a new stock movement (in or out)"""
    try:
        db_movement = stock_movements.create_stock_movement(db=db, stock_movement=movement)
        return db_movement
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/stock-movements/", response_model=List[StockMovementResponse])
def read_stock_movements(
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=1000, description="Number of records to return"),
    item_id: Optional[int] = Query(None, description="Filter by item ID"),
    db: Session = Depends(get_db)
):
    """Get stock movements with optional filtering"""
    movements = stock_movements.get_stock_movements(
        db=db, skip=skip, limit=limit, item_id=item_id
    )
    return movements

@router.get("/stock-movements/{movement_id}", response_model=StockMovementResponse)
def read_stock_movement(movement_id: int, db: Session = Depends(get_db)):
    """Get a specific stock movement"""
    db_movement = stock_movements.get_stock_movement(db=db, movement_id=movement_id)
    if db_movement is None:
        raise HTTPException(status_code=404, detail="Stock movement not found")
    return db_movement

@router.delete("/stock-movements/{movement_id}", response_model=MessageResponse)
def delete_stock_movement(movement_id: int, db: Session = Depends(get_db)):
    """Delete a stock movement and reverse its effect on item quantity"""
    db_movement = stock_movements.delete_stock_movement(db=db, movement_id=movement_id)
    if db_movement is None:
        raise HTTPException(status_code=404, detail="Stock movement not found")
    return MessageResponse(message="Stock movement deleted successfully")

@router.get("/stock-summary/", response_model=StockSummaryResponse)
def get_stock_summary(db: Session = Depends(get_db)):
    """Get stock summary showing total, in, and out quantities for all items"""
    try:
        summary_items = stock_movements.get_stock_summary(db=db)
        return StockSummaryResponse(
            items=summary_items,
            total_items=len(summary_items)
        )
    except Exception as e:
        print(f"Error in stock summary endpoint: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/items/{item_id}/stock-movements/", response_model=List[StockMovementResponse])
def get_item_stock_movements(
    item_id: int,
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(50, ge=1, le=500, description="Number of records to return"),
    db: Session = Depends(get_db)
):
    """Get stock movements for a specific item"""
    movements = stock_movements.get_item_stock_movements(
        db=db, item_id=item_id, skip=skip, limit=limit
    )
    return movements