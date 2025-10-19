#!/usr/bin/env python3
"""
Database Migration Script - Add image_url column to items table
Run this after deploying backend with new model structure
"""

import sys
import os

# Add the backend directory to Python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import text
from database import engine, SessionLocal
from models import Base

def migrate_database():
    """Add image_url column to existing items table"""
    
    print("🔄 Starting database migration...")
    
    try:
        with engine.connect() as connection:
            # Check if image_url column already exists
            result = connection.execute(text("PRAGMA table_info(items)"))
            columns = [row[1] for row in result]
            
            if 'image_url' not in columns:
                print("📝 Adding image_url column to items table...")
                connection.execute(text("ALTER TABLE items ADD COLUMN image_url VARCHAR(500)"))
                connection.commit()
                print("✅ image_url column added successfully!")
            else:
                print("ℹ️  image_url column already exists")
        
        # Create all new tables if they don't exist
        print("🔧 Creating/updating database schema...")
        Base.metadata.create_all(bind=engine)
        print("✅ Database schema updated!")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return False
    
    return True

def test_migration():
    """Test that migration was successful"""
    
    print("🧪 Testing migration...")
    
    try:
        db = SessionLocal()
        
        # Test query to verify image_url column exists
        result = db.execute(text("SELECT id, name, image_url FROM items LIMIT 1"))
        
        print("✅ Migration test passed!")
        return True
        
    except Exception as e:
        print(f"❌ Migration test failed: {e}")
        return False
    finally:
        db.close()

def main():
    """Main migration process"""
    
    print("🗄️  Database Migration Tool")
    print("=" * 40)
    
    # Run migration
    if not migrate_database():
        print("\n❌ Migration failed!")
        sys.exit(1)
    
    # Test migration
    if not test_migration():
        print("\n❌ Migration test failed!")
        sys.exit(1)
    
    print("\n🎉 Migration completed successfully!")
    print("📊 Items table now supports image URLs")
    print("🚀 Deploy your backend and test image upload functionality")

if __name__ == "__main__":
    main()