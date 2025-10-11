from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
from schemas import CategoryResponse, CategoryCreate, CategoryUpdate, MessageResponse
from crud.categories import (
    get_categories, get_category, create_category, 
    update_category, delete_category, get_category_by_name
)

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=List[CategoryResponse])
def get_all_categories(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all categories"""
    categories = get_categories(db, skip=skip, limit=limit)
    return categories

@router.post("/add", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_new_category(category: CategoryCreate, db: Session = Depends(get_db)):
    """Create a new category"""
    # Check if category name already exists
    existing_category = get_category_by_name(db, name=category.name)
    if existing_category:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )
    
    return create_category(db=db, category=category)

@router.get("/{category_id}", response_model=CategoryResponse)
def get_category_by_id(category_id: int, db: Session = Depends(get_db)):
    """Get a specific category by ID"""
    category = get_category(db, category_id=category_id)
    if category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    return category

@router.put("/{category_id}", response_model=CategoryResponse)
def update_existing_category(
    category_id: int, 
    category: CategoryUpdate, 
    db: Session = Depends(get_db)
):
    """Update an existing category"""
    # Check if category exists
    existing_category = get_category(db, category_id=category_id)
    if existing_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Check if new name conflicts with another category
    if category.name != existing_category.name:
        name_conflict = get_category_by_name(db, name=category.name)
        if name_conflict and name_conflict.id != category_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category with this name already exists"
            )
    
    updated_category = update_category(db=db, category_id=category_id, category=category)
    return updated_category

@router.delete("/{category_id}", response_model=MessageResponse)
def delete_existing_category(category_id: int, db: Session = Depends(get_db)):
    """Delete a category"""
    # Check if category exists
    existing_category = get_category(db, category_id=category_id)
    if existing_category is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Category not found"
        )
    
    # Try to delete
    deleted = delete_category(db=db, category_id=category_id)
    if deleted is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete category. It has associated items. Please delete or reassign items first."
        )
    
    return MessageResponse(message="Category deleted successfully")