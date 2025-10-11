from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Category, Item
from schemas import CategoryCreate, CategoryUpdate

def get_category(db: Session, category_id: int):
    """Get a single category by ID"""
    return db.query(Category).filter(Category.id == category_id).first()

def get_categories(db: Session, skip: int = 0, limit: int = 100):
    """Get all categories with optional pagination"""
    return db.query(Category).offset(skip).limit(limit).all()

def create_category(db: Session, category: CategoryCreate):
    """Create a new category"""
    db_category = Category(
        name=category.name,
        description=category.description
    )
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def update_category(db: Session, category_id: int, category: CategoryUpdate):
    """Update an existing category"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category:
        db_category.name = category.name
        db_category.description = category.description
        db_category.updated_at = func.now()
        db.commit()
        db.refresh(db_category)
    return db_category

def delete_category(db: Session, category_id: int):
    """Delete a category (only if no items are associated)"""
    db_category = db.query(Category).filter(Category.id == category_id).first()
    if db_category:
        # Check if category has any items
        item_count = db.query(Item).filter(Item.category_id == category_id).count()
        if item_count > 0:
            return None  # Cannot delete category with items
        
        db.delete(db_category)
        db.commit()
        return True
    return False

def get_category_by_name(db: Session, name: str):
    """Get category by name (for checking duplicates)"""
    return db.query(Category).filter(Category.name == name).first()