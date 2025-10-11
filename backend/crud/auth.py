from sqlalchemy.orm import Session
from models import User
from schemas import UserLogin

def authenticate_user(db: Session, username: str, password: str):
    """Simple authentication - check username and password"""
    user = db.query(User).filter(User.username == username).first()
    
    if not user:
        return None
    
    # Simple password check (in real app, you'd hash passwords)
    if user.password != password:
        return None
    
    return user

def get_user_by_username(db: Session, username: str):
    """Get user by username"""
    return db.query(User).filter(User.username == username).first()

def create_user(db: Session, username: str, password: str):
    """Create new user"""
    db_user = User(username=username, password=password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user