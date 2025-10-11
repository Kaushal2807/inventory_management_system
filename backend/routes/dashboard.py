from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import DashboardStats
from crud.dashboard import get_dashboard_stats, get_category_distribution

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    """Get dashboard statistics"""
    stats = get_dashboard_stats(db)
    return DashboardStats(**stats)

@router.get("/category-distribution")
def get_category_chart_data(db: Session = Depends(get_db)):
    """Get category-wise item distribution for charts"""
    return get_category_distribution(db)