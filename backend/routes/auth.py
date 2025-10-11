from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from schemas import UserLogin, LoginResponse, UserResponse
from crud.auth import authenticate_user
import secrets

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=LoginResponse)
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    """Simple login endpoint"""
    
    # Authenticate user
    user = authenticate_user(db, user_data.username, user_data.password)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )
    
    # Generate simple token (in real app, use JWT)
    token = f"token_{user.username}_{secrets.token_hex(16)}"
    
    # Prepare response
    user_response = UserResponse(
        id=user.id,
        username=user.username,
        created_at=user.created_at
    )
    
    return LoginResponse(
        user=user_response,
        token=token,
        message="Login successful"
    )

@router.post("/logout")
def logout():
    """Simple logout endpoint"""
    return {"message": "Logout successful"}