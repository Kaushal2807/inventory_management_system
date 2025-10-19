#!/usr/bin/env python3
"""
Database Migration Script: Add image_url column to items table
"""

import sqlite3
import os
from pathlib import Path

def migrate_database():
    """Add image_url column to items table"""
    
    # Database paths to check
    db_paths = [
        "inventory.db",  # Local development
        "data/inventory.db",  # Docker production
        "/app/data/inventory.db"  # Render production
    ]
    
    for db_path in db_paths:
        if os.path.exists(db_path):
            print(f"🔍 Found database: {db_path}")
            
            try:
                conn = sqlite3.connect(db_path)
                cursor = conn.cursor()
                
                # Check if image_url column already exists
                cursor.execute("PRAGMA table_info(items)")
                columns = [column[1] for column in cursor.fetchall()]
                
                if 'image_url' not in columns:
                    print("📝 Adding image_url column to items table...")
                    cursor.execute("""
                        ALTER TABLE items 
                        ADD COLUMN image_url TEXT DEFAULT NULL
                    """)
                    conn.commit()
                    print("✅ Migration completed successfully!")
                else:
                    print("ℹ️  image_url column already exists")
                
                # Verify the migration
                cursor.execute("PRAGMA table_info(items)")
                columns = cursor.fetchall()
                print("\n📋 Current items table structure:")
                for col in columns:
                    print(f"   {col[1]} ({col[2]})")
                
                conn.close()
                return True
                
            except Exception as e:
                print(f"❌ Error migrating database {db_path}: {e}")
                if 'conn' in locals():
                    conn.close()
                continue
    
    print("❌ No database found to migrate")
    return False

if __name__ == "__main__":
    print("🚀 Running database migration for image_url column...")
    success = migrate_database()
    
    if success:
        print("\n🎉 Migration completed successfully!")
        print("   Items table now supports image uploads")
    else:
        print("\n❌ Migration failed!")
        print("   Please check database path and permissions")