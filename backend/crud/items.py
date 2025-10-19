from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func
from models import Item, Category
from schemas import ItemCreate, ItemUpdate

def get_item(db: Session, item_id: int):
    """Get a single item by ID with category information"""
    return db.query(Item).options(joinedload(Item.category)).filter(Item.id == item_id).first()

def get_items(db: Session, skip: int = 0, limit: int = 100):
    """Get all items with category information and optional pagination"""
    return db.query(Item).options(joinedload(Item.category)).offset(skip).limit(limit).all()

def create_item(db: Session, item: ItemCreate):
    """Create a new item"""
    
    db_item = Item(
        name=item.name,
        description=item.description,
        category_id=item.category_id,
        purchase_price=item.purchase_price,
        selling_price=item.selling_price,
        quantity=item.quantity,
        min_stock_level=item.min_stock_level,
        image_url=item.image_url
    )
    db.add(db_item)
    db.commit()
    db.refresh(db_item)
    return db_item
    
    # Load the category relationship
    return db.query(Item).options(joinedload(Item.category)).filter(Item.id == db_item.id).first()

def update_item(db: Session, item_id: int, item: ItemUpdate):
    """Update an existing item"""
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if not db_item:
        return None
    
    # Check if category exists
    category = db.query(Category).filter(Category.id == item.category_id).first()
    if not category:
        raise ValueError("Category not found")
    
    # Update fields
    db_item.name = item.name
    db_item.description = item.description
    db_item.category_id = item.category_id
    db_item.purchase_price = item.purchase_price
    db_item.selling_price = item.selling_price
    db_item.quantity = item.quantity
    db_item.min_stock_level = item.min_stock_level
    db_item.image_url = item.image_url
    db_item.updated_at = func.now()
    
    db.commit()
    db.refresh(db_item)
    
    # Load the category relationship
    return db.query(Item).options(joinedload(Item.category)).filter(Item.id == db_item.id).first()

def delete_item(db: Session, item_id: int):
    """Delete an item"""
    db_item = db.query(Item).filter(Item.id == item_id).first()
    if db_item:
        db.delete(db_item)
        db.commit()
        return True
    return False

def get_low_stock_items(db: Session):
    """Get items that are below their minimum stock level"""
    return db.query(Item).filter(Item.quantity < Item.min_stock_level).all()

def get_items_by_category(db: Session, category_id: int):
    """Get all items in a specific category"""
    return db.query(Item).filter(Item.category_id == category_id).all()

def search_items(db: Session, search_term: str):
    """Search items by name and description"""
    search_pattern = f"%{search_term}%"
    return db.query(Item).options(joinedload(Item.category)).filter(
        (Item.name.like(search_pattern)) |
        (Item.description.like(search_pattern))
    ).all()