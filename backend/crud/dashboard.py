from sqlalchemy.orm import Session
from sqlalchemy import func
from models import Item, Category

def get_dashboard_stats(db: Session):
    """Get dashboard statistics"""
    
    # Total items count
    total_items = db.query(Item).count()
    
    # Total categories count
    total_categories = db.query(Category).count()
    
    # Low stock items count (items below minimum stock level)
    low_stock_items = db.query(Item).filter(Item.quantity < Item.min_stock_level).count()
    
    # Total inventory value (selling price * quantity)
    total_value_result = db.query(func.sum(Item.selling_price * Item.quantity)).scalar()
    total_value = float(total_value_result) if total_value_result else 0.0
    
    return {
        "total_items": total_items,
        "total_categories": total_categories,
        "low_stock_items": low_stock_items,
        "total_value": round(total_value, 2)
    }

def get_category_distribution(db: Session):
    """Get item count per category for chart visualization"""
    
    # Get categories with item counts
    category_stats = db.query(
        Category.name,
        func.count(Item.id).label('item_count')
    ).outerjoin(Item).group_by(Category.id, Category.name).all()
    
    return [
        {
            "category_name": stat.name,
            "item_count": stat.item_count
        }
        for stat in category_stats
    ]