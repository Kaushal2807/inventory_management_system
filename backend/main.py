from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from database import engine, Base, init_database
from routes import categories, items, dashboard, stock_movements, payments, auth

# Import models to ensure they are registered with Base
from models import Category, Item, StockMovement, Payment, PaymentItem, User

# Create database tables
init_database()

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
app.include_router(categories.router)
app.include_router(items.router)
app.include_router(dashboard.router)
app.include_router(stock_movements.router)
app.include_router(payments.router)

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
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True if not os.getenv("RAILWAY_ENVIRONMENT") else False
    )