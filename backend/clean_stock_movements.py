#!/usr/bin/env python3
"""
Script to clean up stock movements and keep only real user transactions
"""

from sqlalchemy.orm import Session
from database import SessionLocal
from sqlalchemy import text

def clean_stock_movements():
    db = SessionLocal()
    try:
        print("Cleaning stock movements table...")
        
        # Delete all sample stock movements (keep only real user movements)
        # We'll identify sample movements by their reference numbers or reasons
        result = db.execute(
            text("""
                DELETE FROM stock_movements 
                WHERE reason LIKE 'Purchase order #%' 
                OR reason LIKE 'Sale/Distribution #%'
                OR reference_number LIKE 'PO-%'
                OR reference_number LIKE 'SO-%'
            """)
        )
        print(f"Deleted {result.rowcount} sample stock movements")
        
        db.commit()
        print("Stock movements cleaned successfully!")
        
        # Show remaining movements
        result = db.execute(text("SELECT COUNT(*) FROM stock_movements"))
        count = result.scalar()
        print(f"Remaining stock movements: {count}")
        
        if count > 0:
            result = db.execute(text("""
                SELECT sm.item_id, i.name, sm.movement_type, sm.quantity, sm.reason
                FROM stock_movements sm
                JOIN items i ON sm.item_id = i.id
                ORDER BY sm.created_at DESC
            """))
            print("\nRemaining movements:")
            for row in result:
                print(f"- Item: {row[1]}, Type: {row[2]}, Qty: {row[3]}, Reason: {row[4] or 'N/A'}")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clean_stock_movements()