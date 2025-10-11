#!/usr/bin/env python3
"""
Migration script to convert existing UTC timestamps to IST in the database.
This script adds 5.5 hours to all datetime fields to convert from UTC to IST.
"""

import sys
import os
from datetime import datetime, timedelta

# Add the backend directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal, engine
from models import Category, Item, StockMovement, Payment, PaymentItem
from sqlalchemy import text

def convert_utc_to_ist():
    """Convert all UTC timestamps in the database to IST by adding 5.5 hours"""
    
    db = SessionLocal()
    
    try:
        print("🕐 Starting timezone migration from UTC to IST...")
        print("=" * 50)
        
        # IST is UTC + 5:30
        ist_offset = timedelta(hours=5, minutes=30)
        
        # Update Categories
        print("📂 Updating Categories timestamps...")
        categories = db.query(Category).all()
        categories_updated = 0
        for category in categories:
            if category.created_at:
                category.created_at = category.created_at + ist_offset
                categories_updated += 1
            if category.updated_at:
                category.updated_at = category.updated_at + ist_offset
        print(f"   ✅ Updated {categories_updated} category records")
        
        # Update Items
        print("📦 Updating Items timestamps...")
        items = db.query(Item).all()
        items_updated = 0
        for item in items:
            if item.created_at:
                item.created_at = item.created_at + ist_offset
                items_updated += 1
            if item.updated_at:
                item.updated_at = item.updated_at + ist_offset
        print(f"   ✅ Updated {items_updated} item records")
        
        # Update Stock Movements
        print("📈 Updating Stock Movements timestamps...")
        movements = db.query(StockMovement).all()
        movements_updated = 0
        for movement in movements:
            if movement.created_at:
                movement.created_at = movement.created_at + ist_offset
                movements_updated += 1
        print(f"   ✅ Updated {movements_updated} stock movement records")
        
        # Update Payments
        print("💳 Updating Payments timestamps...")
        payments = db.query(Payment).all()
        payments_updated = 0
        for payment in payments:
            if payment.payment_date:
                old_time = payment.payment_date
                payment.payment_date = payment.payment_date + ist_offset
                print(f"   Payment #{payment.id}: {old_time} → {payment.payment_date}")
                payments_updated += 1
            if payment.created_at:
                payment.created_at = payment.created_at + ist_offset
            if payment.updated_at:
                payment.updated_at = payment.updated_at + ist_offset
        print(f"   ✅ Updated {payments_updated} payment records")
        
        # Update Payment Items
        print("🛒 Updating Payment Items timestamps...")
        payment_items = db.query(PaymentItem).all()
        items_updated = 0
        for item in payment_items:
            if item.created_at:
                item.created_at = item.created_at + ist_offset
                items_updated += 1
        print(f"   ✅ Updated {items_updated} payment item records")
        
        # Commit all changes
        db.commit()
        
        print("=" * 50)
        print("✅ Migration completed successfully!")
        print(f"📊 Summary:")
        print(f"   - Categories: {categories_updated} records updated")
        print(f"   - Items: {items_updated} records updated") 
        print(f"   - Stock Movements: {movements_updated} records updated")
        print(f"   - Payments: {payments_updated} records updated")
        print(f"   - Payment Items: {items_updated} records updated")
        print("🎉 All timestamps have been converted from UTC to IST!")
        
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        db.rollback()
        return False
        
    finally:
        db.close()
    
    return True

def verify_migration():
    """Verify that the migration worked correctly"""
    
    db = SessionLocal()
    
    try:
        print("\n🔍 Verifying migration...")
        print("=" * 30)
        
        # Check latest payment
        latest_payment = db.query(Payment).order_by(Payment.id.desc()).first()
        if latest_payment:
            print(f"Latest payment time: {latest_payment.payment_date}")
            
        # Check some categories
        latest_category = db.query(Category).order_by(Category.id.desc()).first()
        if latest_category:
            print(f"Latest category time: {latest_category.created_at}")
            
        # Check some items
        latest_item = db.query(Item).order_by(Item.id.desc()).first()
        if latest_item:
            print(f"Latest item time: {latest_item.created_at}")
            
        print("✅ Verification complete!")
        
    except Exception as e:
        print(f"❌ Error during verification: {e}")
        
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Database Timezone Migration Script")
    print("This will convert all UTC timestamps to IST (UTC + 5:30)")
    
    # Ask for confirmation
    response = input("\n⚠️  Are you sure you want to proceed? (y/N): ")
    
    if response.lower() in ['y', 'yes']:
        success = convert_utc_to_ist()
        if success:
            verify_migration()
    else:
        print("❌ Migration cancelled by user")
        sys.exit(1)