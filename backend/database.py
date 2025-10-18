import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Database URL - handles both local and production environments
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./inventory.db")

# For Docker/Production deployment, use persistent storage
if os.getenv("RAILWAY_ENVIRONMENT") or os.getenv("DOCKER_ENVIRONMENT"):
    # Production environment - Use persistent data directory
    os.makedirs("/app/data", exist_ok=True)
    DATABASE_URL = "sqlite:///./data/inventory.db"
elif "/app" in os.getcwd():
    # Running in Docker container
    os.makedirs("/app/data", exist_ok=True) 
    DATABASE_URL = "sqlite:///./data/inventory.db"

# Create SQLAlchemy engine
# For local development, use in-memory database to avoid SQLite issues
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=True  # Enable SQL logging for debugging
)

# Create SessionLocal class
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create Base class for models
Base = declarative_base()

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Initialize database with tables
def init_database():
    """Create all database tables"""
    print("🔧 Initializing database...")
    
    # Import models to ensure they are registered
    from models import Category, Item
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully")
    
    # Check if database file was created
    if "sqlite:///" in DATABASE_URL:
        db_file = DATABASE_URL.replace("sqlite:///", "").replace("./", "")
        if os.path.exists(db_file):
            print(f"✅ SQLite database file created: {db_file}")
        else:
            print(f"❌ Database file not found: {db_file}")
    
    return True

# Check database connection
def check_db_connection():
    """Test database connection"""
    try:
        from sqlalchemy import text
        db = SessionLocal()
        # Try to execute a simple query
        db.execute(text("SELECT 1"))
        db.close()
        print("✅ Database connection successful")
        return True
    except Exception as e:
        print(f"❌ Database connection failed: {e}")
        return False

if __name__ == "__main__":
    print(f"Database URL: {DATABASE_URL}")
    check_db_connection()
    init_database()