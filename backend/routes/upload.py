import os
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import Optional
import shutil
from pathlib import Path

router = APIRouter(prefix="/upload", tags=["File Upload"])

# Create uploads directory if it doesn't exist
UPLOAD_DIR = Path("uploads")
UPLOAD_DIR.mkdir(exist_ok=True)

# Allowed image file types
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB

def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@router.post("/image")
async def upload_image(file: UploadFile = File(...)):
    """Upload an image file for items"""
    
    # Validate file type
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    
    # Validate file size
    file_content = await file.read()
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size too large. Maximum size: 5MB"
        )
    
    # Generate unique filename
    file_extension = file.filename.rsplit('.', 1)[1].lower()
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    try:
        # Save file
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Return relative URL that can be used by frontend
        file_url = f"/uploads/{unique_filename}"
        
        return {
            "success": True,
            "file_url": file_url,
            "filename": unique_filename,
            "original_name": file.filename,
            "size": len(file_content)
        }
        
    except Exception as e:
        # Clean up file if error occurs
        if file_path.exists():
            file_path.unlink()
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to upload file: {str(e)}"
        )

@router.delete("/image/{filename}")
async def delete_image(filename: str):
    """Delete an uploaded image"""
    
    file_path = UPLOAD_DIR / filename
    
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    try:
        file_path.unlink()
        return {"success": True, "message": "File deleted successfully"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete file: {str(e)}"
        )