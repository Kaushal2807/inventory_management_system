"""
Local testing database using JSON file storage
This avoids all SQLite dependencies for local development
"""

import json
import os
from datetime import datetime
from typing import List, Optional, Dict, Any
import uuid

class JSONDatabase:
    def __init__(self, db_file: str = "inventory_local.json"):
        self.db_file = db_file
        self.data = {"categories": [], "items": []}
        self.load_data()
    
    def load_data(self):
        """Load data from JSON file"""
        if os.path.exists(self.db_file):
            try:
                with open(self.db_file, 'r') as f:
                    self.data = json.load(f)
            except Exception as e:
                print(f"Error loading data: {e}")
                self.data = {"categories": [], "items": []}
        else:
            self.init_sample_data()
    
    def save_data(self):
        """Save data to JSON file"""
        try:
            with open(self.db_file, 'w') as f:
                json.dump(self.data, f, indent=2, default=str)
        except Exception as e:
            print(f"Error saving data: {e}")
    
    def init_sample_data(self):
        """Initialize with sample data"""
        self.data = {
            "categories": [
                {
                    "id": 1,
                    "name": "Electronics",
                    "description": "Electronic devices and components",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                },
                {
                    "id": 2,
                    "name": "Office Supplies",
                    "description": "Office and stationery items",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                },
                {
                    "id": 3,
                    "name": "Furniture",
                    "description": "Office and home furniture",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
            ],
            "items": [
                {
                    "id": 1,
                    "name": "Laptop Dell XPS 13",
                    "description": "High-performance ultrabook",
                    "category_id": 1,
                    "purchase_price": 800.00,
                    "selling_price": 1200.00,
                    "quantity": 10,
                    "min_stock_level": 2,
                    "sku": "DELL-XPS13-001",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                },
                {
                    "id": 2,
                    "name": "Wireless Mouse",
                    "description": "Bluetooth wireless mouse",
                    "category_id": 1,
                    "purchase_price": 15.00,
                    "selling_price": 25.00,
                    "quantity": 50,
                    "min_stock_level": 10,
                    "sku": "MOUSE-BT-001",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                },
                {
                    "id": 3,
                    "name": "Office Chair",
                    "description": "Ergonomic office chair",
                    "category_id": 3,
                    "purchase_price": 150.00,
                    "selling_price": 250.00,
                    "quantity": 1,  # Low stock for testing
                    "min_stock_level": 2,
                    "sku": "CHAIR-ERG-001",
                    "created_at": datetime.now().isoformat(),
                    "updated_at": datetime.now().isoformat()
                }
            ]
        }
        self.save_data()
    
    def get_next_id(self, table: str) -> int:
        """Get next available ID for a table"""
        if not self.data[table]:
            return 1
        return max(item["id"] for item in self.data[table]) + 1
    
    # Category operations
    def get_categories(self) -> List[Dict]:
        return self.data["categories"]
    
    def get_category(self, category_id: int) -> Optional[Dict]:
        for category in self.data["categories"]:
            if category["id"] == category_id:
                return category
        return None
    
    def create_category(self, category_data: Dict) -> Dict:
        category = {
            "id": self.get_next_id("categories"),
            "name": category_data["name"],
            "description": category_data.get("description", ""),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        self.data["categories"].append(category)
        self.save_data()
        return category
    
    def update_category(self, category_id: int, category_data: Dict) -> Optional[Dict]:
        for i, category in enumerate(self.data["categories"]):
            if category["id"] == category_id:
                self.data["categories"][i].update({
                    "name": category_data["name"],
                    "description": category_data.get("description", category["description"]),
                    "updated_at": datetime.now().isoformat()
                })
                self.save_data()
                return self.data["categories"][i]
        return None
    
    def delete_category(self, category_id: int) -> bool:
        # Check if category has items
        for item in self.data["items"]:
            if item["category_id"] == category_id:
                return False  # Cannot delete category with items
        
        for i, category in enumerate(self.data["categories"]):
            if category["id"] == category_id:
                del self.data["categories"][i]
                self.save_data()
                return True
        return False
    
    # Item operations
    def get_items(self, search: Optional[str] = None, category_id: Optional[int] = None) -> List[Dict]:
        items = self.data["items"]
        
        if search:
            search = search.lower()
            items = [item for item in items if 
                    search in item["name"].lower() or 
                    search in item["description"].lower() or
                    search in item["sku"].lower()]
        
        if category_id:
            items = [item for item in items if item["category_id"] == category_id]
        
        return items
    
    def get_item(self, item_id: int) -> Optional[Dict]:
        for item in self.data["items"]:
            if item["id"] == item_id:
                return item
        return None
    
    def create_item(self, item_data: Dict) -> Dict:
        item = {
            "id": self.get_next_id("items"),
            "name": item_data["name"],
            "description": item_data.get("description", ""),
            "category_id": item_data["category_id"],
            "purchase_price": float(item_data["purchase_price"]),
            "selling_price": float(item_data["selling_price"]),
            "quantity": int(item_data["quantity"]),
            "min_stock_level": int(item_data.get("min_stock_level", 0)),
            "sku": item_data.get("sku", f"SKU-{self.get_next_id('items')}"),
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        self.data["items"].append(item)
        self.save_data()
        return item
    
    def update_item(self, item_id: int, item_data: Dict) -> Optional[Dict]:
        for i, item in enumerate(self.data["items"]):
            if item["id"] == item_id:
                self.data["items"][i].update({
                    "name": item_data["name"],
                    "description": item_data.get("description", item["description"]),
                    "category_id": item_data["category_id"],
                    "purchase_price": float(item_data["purchase_price"]),
                    "selling_price": float(item_data["selling_price"]),
                    "quantity": int(item_data["quantity"]),
                    "min_stock_level": int(item_data.get("min_stock_level", item["min_stock_level"])),
                    "sku": item_data.get("sku", item["sku"]),
                    "updated_at": datetime.now().isoformat()
                })
                self.save_data()
                return self.data["items"][i]
        return None
    
    def delete_item(self, item_id: int) -> bool:
        for i, item in enumerate(self.data["items"]):
            if item["id"] == item_id:
                del self.data["items"][i]
                self.save_data()
                return True
        return False
    
    # Dashboard operations
    def get_dashboard_stats(self) -> Dict:
        items = self.data["items"]
        categories = self.data["categories"]
        
        total_items = len(items)
        total_categories = len(categories)
        total_value = sum(item["purchase_price"] * item["quantity"] for item in items)
        low_stock_items = [item for item in items if item["quantity"] <= item["min_stock_level"]]
        
        return {
            "total_items": total_items,
            "total_categories": total_categories,
            "total_value": round(total_value, 2),
            "low_stock_count": len(low_stock_items),
            "low_stock_items": low_stock_items
        }

# Global database instance
db = JSONDatabase()