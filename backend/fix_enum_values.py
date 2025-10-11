#!/usr/bin/env python3
"""
Script to fix enum values in stock_movements table
"""

from sqlalchemy.orm import Session
from database import SessionLocal, engine
from sqlalchemy import text

def fix_enum_values():
    db = SessionLocal()
    try:
        print("Fixing enum values in stock_movements table...")
        
        # Update lowercase 'in' to uppercase 'IN'
        result_in = db.execute(
            text("UPDATE stock_movements SET movement_type = 'IN' WHERE movement_type = 'in'")
        )
        print(f"Updated {result_in.rowcount} 'in' movements to 'IN'")
        
        # Update lowercase 'out' to uppercase 'OUT'
        result_out = db.execute(
            text("UPDATE stock_movements SET movement_type = 'OUT' WHERE movement_type = 'out'")
        )
        print(f"Updated {result_out.rowcount} 'out' movements to 'OUT'")
        
        db.commit()
        print("Successfully fixed all enum values!")
        
        # Verify the fix
        result = db.execute(text("SELECT movement_type, COUNT(*) FROM stock_movements GROUP BY movement_type"))
        print("\nCurrent movement types in database:")
        for row in result:
            print(f"- {row[0]}: {row[1]} movements")
        
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_enum_values()