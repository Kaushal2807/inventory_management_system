from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from pathlib import Path

from database import engine, Base, init_database
from routes import categories, items, dashboard, stock_movements, payments, auth, users, upload

# Import models to ensure they are registered with Base
from models import Category, Item, StockMovement, Payment, PaymentItem, User

# Create database tables
init_database()

# Initialize default users for production
def init_default_users():
    """Create default users if they don't exist"""
    from database import SessionLocal
    from crud.auth import create_user, get_user_by_username
    
    db = SessionLocal()
    try:
        # Create default users if they don't exist
        default_users = [
            {"username": "admin", "password": "admin123"},
            {"username": "test", "password": "test123"},
            {"username": "user", "password": "user123"},
            {"username": "demo", "password": "demo123"}
        ]
        
        for user_data in default_users:
            if not get_user_by_username(db, user_data["username"]):
                create_user(db, user_data["username"], user_data["password"])
                print(f"✅ Created user: {user_data['username']}")
    except Exception as e:
        print(f"❌ Error creating users: {e}")
    finally:
        db.close()

# Initialize users on startup
init_default_users()

# Create FastAPI app
app = FastAPI(
    title="Inventory Management System API",
    description="A comprehensive inventory management system with items and categories",
    version="1.0.0",
)

# Configure CORS
origins = [
    "http://localhost:3000",  # React development server
    "http://127.0.0.1:3000",
    "https://localhost:3000",
    # Add your production frontend URL here when deploying
    # "https://your-frontend-domain.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(users.router)
app.include_router(categories.router)
app.include_router(items.router)
app.include_router(dashboard.router)
app.include_router(stock_movements.router)
app.include_router(payments.router)
app.include_router(upload.router)

# Mount static files directory for serving uploaded images
uploads_dir = Path("uploads")
uploads_dir.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Inventory Management System API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    # Disable reload in production environments
    reload_mode = not (os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("DOCKER_ENVIRONMENT") or "/app" in os.getcwd())
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=reload_mode
    )