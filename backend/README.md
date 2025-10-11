# Inventory Management System - Backend API

A FastAPI-based REST API for managing inventory items and categories with SQLite database.

## 🚀 Features

### ✅ Complete API Implementation

- **Categories Management** (5 endpoints)
- **Items Management** (5 endpoints)  
- **Dashboard Statistics** (1 endpoint)
- **Search & Filtering**
- **Data Validation**
- **Error Handling**
- **CORS Support**

## 🛠️ Tech Stack

- **FastAPI** - Modern, fast web framework
- **SQLAlchemy** - SQL toolkit and ORM
- **SQLite** - Lightweight database
- **Pydantic** - Data validation
- **Uvicorn** - ASGI web server

## 📁 Project Structure

```
backend/
├── main.py              # FastAPI application
├── database.py          # Database configuration
├── models.py            # SQLAlchemy models
├── schemas.py           # Pydantic schemas
├── requirements.txt     # Dependencies
├── .env                # Environment variables
├── Procfile            # Railway deployment
├── railway.json        # Railway configuration
├── crud/               # Database operations
│   ├── __init__.py
│   ├── categories.py   # Category CRUD
│   ├── items.py        # Item CRUD
│   └── dashboard.py    # Dashboard stats
└── routes/             # API endpoints
    ├── __init__.py
    ├── categories.py   # Category routes
    ├── items.py        # Item routes
    └── dashboard.py    # Dashboard routes
```

## 📋 API Endpoints

### Categories
```
GET    /api/categories           # List all categories
POST   /api/categories           # Create new category
GET    /api/categories/{id}      # Get category by ID
PUT    /api/categories/{id}      # Update category
DELETE /api/categories/{id}      # Delete category
```

### Items
```
GET    /api/items               # List all items
POST   /api/items               # Create new item
GET    /api/items/{id}          # Get item by ID
PUT    /api/items/{id}          # Update item
DELETE /api/items/{id}          # Delete item
```

### Dashboard
```
GET    /api/dashboard/stats     # Get dashboard statistics
```

### Additional Features
```
GET    /api/items?search=term   # Search items
GET    /api/items?category_id=1 # Filter by category
GET    /api/items?low_stock=true # Get low stock items
```

## 🗄️ Database Schema

### Categories Table
```sql
- id (Primary Key)
- name (String, Required, Unique)
- description (Text, Optional)
- created_at (DateTime)
- updated_at (DateTime)
```

### Items Table
```sql
- id (Primary Key)
- name (String, Required)
- description (Text, Optional)
- category_id (Foreign Key)
- purchase_price (Float, Required)
- selling_price (Float, Required)
- quantity (Integer, Required)
- min_stock_level (Integer, Default: 10)
- sku (String, Optional, Unique)
- created_at (DateTime)
- updated_at (DateTime)
```

## 🚀 Quick Start

### 1. Local Development

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run the server
python main.py
```

The API will be available at:
- **API:** http://localhost:8000
- **Documentation:** http://localhost:8000/docs
- **Alternative Docs:** http://localhost:8000/redoc

### 2. Environment Variables

Create `.env` file:
```env
DATABASE_URL=sqlite:///./inventory.db
HOST=0.0.0.0
PORT=8000
DEBUG=True
```

## 🌐 Deployment

### Railway.app (Recommended)

1. **Connect Repository:**
   ```bash
   # Push to GitHub
   git add .
   git commit -m "Backend implementation"
   git push origin main
   ```

2. **Deploy on Railway:**
   - Go to railway.app
   - Connect your GitHub repository
   - Select the backend folder
   - Railway will auto-detect and deploy

3. **Environment Variables (Railway):**
   ```
   PORT=8000
   HOST=0.0.0.0
   RAILWAY_ENVIRONMENT=production
   ```

### Alternative Platforms

- **Render.com** - Use `python main.py` as start command
- **Fly.io** - Include fly.toml configuration
- **DigitalOcean App Platform** - Use Procfile

## 📊 Sample API Responses

### Category Response
```json
{
  "id": 1,
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "created_at": "2023-10-08T10:00:00",
  "updated_at": "2023-10-08T10:00:00"
}
```

### Item Response
```json
{
  "id": 1,
  "name": "Gaming Laptop",
  "description": "High-performance gaming laptop",
  "category_id": 1,
  "purchase_price": 800.00,
  "selling_price": 1200.00,
  "quantity": 5,
  "min_stock_level": 2,
  "sku": "LAP-001",
  "created_at": "2023-10-08T10:00:00",
  "updated_at": "2023-10-08T10:00:00",
  "category": {
    "id": 1,
    "name": "Electronics",
    "description": "Electronic devices"
  }
}
```

### Dashboard Stats Response
```json
{
  "total_items": 150,
  "total_categories": 12,
  "low_stock_items": 8,
  "total_value": 45000.50
}
```

## ✅ Features Implemented

- ✅ **CRUD Operations** for Categories and Items
- ✅ **Data Validation** with Pydantic schemas
- ✅ **Error Handling** with proper HTTP status codes
- ✅ **Search Functionality** for items
- ✅ **Filtering** by category and stock level
- ✅ **Relationships** between items and categories
- ✅ **Dashboard Statistics** calculation
- ✅ **CORS Support** for frontend integration
- ✅ **Auto-generated Documentation** with FastAPI
- ✅ **Database Migrations** with SQLAlchemy
- ✅ **Production Ready** deployment configuration

## 🔧 API Documentation

Once the server is running, visit:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## 🔒 Data Validation

All endpoints include comprehensive validation:
- Required fields validation
- Data type validation  
- Business logic validation (e.g., unique SKU, positive prices)
- Foreign key constraints

## 📈 Performance Features

- **Database Indexing** on frequently queried fields
- **Relationship Loading** optimization with joinedload
- **Query Optimization** for dashboard statistics
- **Connection Pooling** with SQLAlchemy

## 🔄 Integration with Frontend

This backend is designed to work seamlessly with the React frontend:
- **Matching API endpoints** for all frontend features
- **CORS configured** for React development server
- **Response formats** match frontend TypeScript interfaces
- **Error handling** provides user-friendly messages

## 📝 Notes

- **SQLite Database** file will be created automatically
- **Tables** are created on first run
- **Data persists** between server restarts
- **Railway.app** provides persistent storage for production
- **Backup** SQLite file regularly for data safety

---

**🎉 Your backend API is complete and ready for production!**