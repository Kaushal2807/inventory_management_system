from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from schemas import ItemResponse, ItemCreate, ItemUpdate, MessageResponse
from crud.items import (
    get_items, get_item, create_item, update_item, delete_item,
    get_low_stock_items, get_items_by_category, search_items
)

router = APIRouter(prefix="/items", tags=["items"])

@router.get("/", response_model=List[ItemResponse])
def get_all_items(
    skip: int = 0, 
    limit: int = 100,
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    search: Optional[str] = Query(None, description="Search in name and description"),
    low_stock: Optional[bool] = Query(None, description="Filter low stock items"),
    db: Session = Depends(get_db)
):
    """Get all items with optional filtering"""
    
    if search:
        items = search_items(db, search_term=search)
    elif category_id:
        items = get_items_by_category(db, category_id=category_id)
    elif low_stock:
        items = get_low_stock_items(db)
    else:
        items = get_items(db, skip=skip, limit=limit)
    
    return items

@router.post("/add", response_model=ItemResponse, status_code=status.HTTP_201_CREATED)
def create_new_item(item: ItemCreate, db: Session = Depends(get_db)):
    """Create a new item"""
    try:
        return create_item(db=db, item=item)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.get("/{item_id}", response_model=ItemResponse)
def get_item_by_id(item_id: int, db: Session = Depends(get_db)):
    """Get a specific item by ID"""
    item = get_item(db, item_id=item_id)
    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    return item

@router.put("/{item_id}", response_model=ItemResponse)
def update_existing_item(
    item_id: int, 
    item: ItemUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing item"""
    try:
        updated_item = update_item(db=db, item_id=item_id, item=item)
        if updated_item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Item not found"
            )
        return updated_item
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.delete("/{item_id}", response_model=MessageResponse)
def delete_existing_item(item_id: int, db: Session = Depends(get_db)):
    """Delete an item"""
    # Check if item exists
    existing_item = get_item(db, item_id=item_id)
    if existing_item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found"
        )
    
    # Delete the item
    deleted = delete_item(db=db, item_id=item_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete item"
        )
    
    return MessageResponse(message="Item deleted successfully")