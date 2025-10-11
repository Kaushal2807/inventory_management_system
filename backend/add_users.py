#!/usr/bin/env python3
"""
Script to add initial users to the database
"""

from sqlalchemy.orm import Session
from database import SessionLocal, init_database
from crud.auth import create_user, get_user_by_username
from models import User
import hashlib

def add_initial_users():
    """Add initial users to the database"""
    # Make sure database is initialized
    init_database()
    
    db = SessionLocal()
    try:
        # Initial users to add
        initial_users = [
            {"username": "admin", "password": "admin123"},
            {"username": "user", "password": "user123"},
            {"username": "test", "password": "test123"},
            {"username": "demo", "password": "demo123"}
        ]
        
        for user_data in initial_users:
            # Check if user already exists
            existing_user = get_user_by_username(db=db, username=user_data["username"])
            
            if not existing_user:
                # Create user
                new_user = create_user(db=db, username=user_data["username"], password=user_data["password"])
                print(f"✅ User '{user_data['username']}' created successfully")
            else:
                print(f"⚠️  User '{user_data['username']}' already exists")
    
    except Exception as e:
        print(f"❌ Error adding users: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Adding initial users to database...")
    add_initial_users()
    print("✅ Done!")