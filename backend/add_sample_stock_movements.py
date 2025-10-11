#!/usr/bin/env python3
"""
Script to add sample stock movements to demonstrate the stock tracking functionality
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from models import StockMovement, Item
from datetime import datetime, timedelta
import random

def add_sample_stock_movements():
    db = SessionLocal()
    try:
        # Get all items
        items = db.query(Item).all()
        
        if not items:
            print("No items found. Please add some items first.")
            return
        
        print(f"Found {len(items)} items. Adding sample stock movements...")
        
        # Sample stock movements for demonstration
        sample_movements = []
        
        for item in items[:3]:  # Just use first 3 items for demo
            # Add some stock IN movements (purchases/deliveries)
            for i in range(2, 5):  # 2-4 stock in movements per item
                movement = StockMovement(
                    item_id=item.id,
                    movement_type="IN",
                    quantity=random.randint(10, 50),
                    reason=f"Purchase order #{random.randint(1000, 9999)}",
                    reference_number=f"PO-{random.randint(100, 999)}",
                    created_at=datetime.now() - timedelta(days=random.randint(1, 30))
                )
                sample_movements.append(movement)
            
            # Add some stock OUT movements (sales/usage)
            for i in range(1, 3):  # 1-2 stock out movements per item
                movement = StockMovement(
                    item_id=item.id,
                    movement_type="OUT",
                    quantity=random.randint(5, 20),
                    reason=f"Sale/Distribution #{random.randint(1000, 9999)}",
                    reference_number=f"SO-{random.randint(100, 999)}",
                    created_at=datetime.now() - timedelta(days=random.randint(1, 15))
                )
                sample_movements.append(movement)
        
        # Add all movements to database
        for movement in sample_movements:
            db.add(movement)
        
        db.commit()
        print(f"Successfully added {len(sample_movements)} sample stock movements!")
        
        # Show summary
        print("\nSample movements added:")
        for movement in sample_movements:
            item_name = db.query(Item).filter(Item.id == movement.item_id).first().name
            print(f"- {item_name}: {movement.movement_type.upper()} {movement.quantity} units ({movement.reason})")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    add_sample_stock_movements()