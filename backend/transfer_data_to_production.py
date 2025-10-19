#!/usr/bin/env python3
"""
Script to export local database data and transfer to production
Export local data → Upload to production backend via API
"""

import requests
import json
from database import SessionLocal
from models import Category, Item, StockMovement, Payment, User
from sqlalchemy.orm import Session
import sys

PRODUCTION_API_URL = "https://inventory-management-backend-xxs3.onrender.com"

def export_local_data():
    """Export all data from local database"""
    db = SessionLocal()
    
    try:
        print("📤 Exporting local database data...")
        
        # Export Categories
        categories = db.query(Category).all()
        categories_data = []
        for cat in categories:
            categories_data.append({
                "name": cat.name,
                "description": cat.description
            })
        
        # Export Items  
        items = db.query(Item).all()
        items_data = []
        for item in items:
            items_data.append({
                "name": item.name,
                "description": item.description or "",
                "category_id": item.category_id,
                "purchase_price": float(item.purchase_price or 0),
                "selling_price": float(item.selling_price or 0),
                "quantity": item.quantity,
                "min_stock_level": item.min_stock_level or 10,
                "image_url": item.image_url
            })
        
        # Export Stock Movements
        movements = db.query(StockMovement).all()
        movements_data = []
        for movement in movements:
            movements_data.append({
                "item_id": movement.item_id,
                "movement_type": movement.movement_type,
                "quantity": movement.quantity,
                "reason": movement.reason or "",
                "reference_number": movement.reference_number or ""
            })
        
        # Export Payments
        payments = db.query(Payment).all()
        payments_data = []
        for payment in payments:
            payments_data.append({
                "customer_name": payment.customer_name,
                "subtotal": float(payment.subtotal),
                "discount": float(payment.discount),
                "total_amount": float(payment.total_amount),
                "payment_date": payment.payment_date.isoformat() if payment.payment_date else None
            })
        
        print(f"✅ Exported: {len(categories_data)} categories, {len(items_data)} items")
        print(f"✅ Exported: {len(movements_data)} movements, {len(payments_data)} payments")
        
        return {
            "categories": categories_data,
            "items": items_data,
            "movements": movements_data,
            "payments": payments_data
        }
        
    except Exception as e:
        print(f"❌ Error exporting data: {e}")
        return None
    finally:
        db.close()

def upload_to_production(data):
    """Upload data to production via API"""
    try:
        print("🚀 Uploading data to production...")
        
        # Login to get token
        login_response = requests.post(
            f"{PRODUCTION_API_URL}/auth/login",
            json={"username": "admin", "password": "admin123"},
            headers={"Content-Type": "application/json"}
        )
        
        if login_response.status_code != 200:
            print(f"❌ Login failed: {login_response.status_code}")
            return False
        
        auth_data = login_response.json()
        token = auth_data.get("token", "")
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {token}"
        }
        
        # Upload Categories
        category_mapping = {}  # Map old ID to new ID
        for i, category in enumerate(data["categories"]):
            response = requests.post(
                f"{PRODUCTION_API_URL}/categories/add",
                json=category,
                headers=headers
            )
            if response.status_code in [200, 201]:
                new_cat = response.json()
                category_mapping[i + 1] = new_cat.get("id")
                print(f"✅ Category uploaded: {category['name']}")
            else:
                print(f"❌ Failed to upload category: {category['name']}")
        
        # Upload Items (with updated category IDs)
        item_mapping = {}  # Map old ID to new ID
        for i, item in enumerate(data["items"]):
            # Update category ID mapping
            old_cat_id = item["category_id"]
            new_cat_id = category_mapping.get(old_cat_id, 1)
            item["category_id"] = new_cat_id
            
            response = requests.post(
                f"{PRODUCTION_API_URL}/items/add",
                json=item,
                headers=headers
            )
            if response.status_code in [200, 201]:
                new_item = response.json()
                item_mapping[i + 1] = new_item.get("id")
                print(f"✅ Item uploaded: {item['name']}")
            else:
                print(f"❌ Failed to upload item: {item['name']}")
        
        print(f"🎉 Successfully uploaded {len(data['categories'])} categories and {len(data['items'])} items!")
        return True
        
    except Exception as e:
        print(f"❌ Error uploading to production: {e}")
        return False

def main():
    """Main function to export and upload data"""
    print("🔄 Transferring local database to production...")
    
    # Export local data
    data = export_local_data()
    if not data:
        print("❌ Failed to export local data")
        sys.exit(1)
    
    # Show summary
    print(f"\n📊 Data Summary:")
    print(f"   Categories: {len(data['categories'])}")
    print(f"   Items: {len(data['items'])}")
    print(f"   Stock Movements: {len(data['movements'])}")
    print(f"   Payments: {len(data['payments'])}")
    
    # Ask for confirmation
    confirm = input("\n🤔 Upload this data to production? (y/n): ")
    if confirm.lower() != 'y':
        print("❌ Upload cancelled")
        sys.exit(0)
    
    # Upload to production
    success = upload_to_production(data)
    if success:
        print("\n🎉 Transfer completed successfully!")
        print("🌐 Check your frontend dashboard - data should now be visible!")
    else:
        print("\n❌ Transfer failed. Please check the logs above.")

if __name__ == "__main__":
    main()