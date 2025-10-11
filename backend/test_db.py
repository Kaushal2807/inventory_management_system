#!/usr/bin/env python3
"""
Test script to verify database creation and table structure
"""

import os
import sys
sys.path.append('/home/user/Desktop/inventory_web/backend')

from database import DATABASE_URL, engine, Base, SessionLocal
from models import Category, Item

def test_database():
    print(f"🔧 Testing database creation...")
    print(f"Database URL: {DATABASE_URL}")
    
    # Remove existing database
    db_file = DATABASE_URL.replace("sqlite:///", "").replace("./", "")
    if os.path.exists(db_file):
        os.remove(db_file)
        print(f"Removed existing database: {db_file}")
    
    # Create tables explicitly
    print("Creating tables...")
    Base.metadata.create_all(bind=engine)
    
    # Check if file exists and its size
    if os.path.exists(db_file):
        size = os.path.getsize(db_file)
        print(f"✅ Database file created: {db_file} (size: {size} bytes)")
    else:
        print(f"❌ Database file not created: {db_file}")
        return False
    
    # Test database connection
    try:
        db = SessionLocal()
        
        # Create a test category
        test_category = Category(name="Test Category", description="Test description")
        db.add(test_category)
        db.commit()
        
        # Query it back
        categories = db.query(Category).all()
        print(f"✅ Categories in database: {len(categories)}")
        
        # Create a test item
        test_item = Item(
            name="Test Item",
            description="Test item description",
            category_id=test_category.id,
            purchase_price=10.0,
            selling_price=15.0,
            quantity=5
        )
        db.add(test_item)
        db.commit()
        
        # Query items
        items = db.query(Item).all()
        print(f"✅ Items in database: {len(items)}")
        
        db.close()
        
        # Final file size check
        final_size = os.path.getsize(db_file)
        print(f"✅ Final database size: {final_size} bytes")
        
        return True
        
    except Exception as e:
        print(f"❌ Database test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_database()
    if success:
        print("🎉 Database test completed successfully!")
    else:
        print("💥 Database test failed!")