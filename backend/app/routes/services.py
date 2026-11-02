from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.session import get_db
from app.models.models import Service, Schedule
from app.schemas.schemas import ServiceResponse, ServiceDetailResponse

router = APIRouter(prefix="/services", tags=["Services"])

@router.get("", response_model=List[ServiceResponse])
def list_services(
    category: Optional[str] = None,
    area: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Service)
    if category and category != "All":
        query = query.filter(Service.category.ilike(f"%{category}%"))
    if area and area != "All Areas":
        query = query.filter(or_(Service.area.ilike(f"%{area}%"), Service.area == "All Areas"))
    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Service.service_name.ilike(s),
                Service.description.ilike(s),
                Service.category.ilike(s)
            )
        )
    return query.order_by(Service.category.asc(), Service.service_name.asc()).all()

@router.get("/{service_id}", response_model=ServiceDetailResponse)
def get_service_detail(service_id: int, db: Session = Depends(get_db)):
    service = db.query(Service).filter(Service.id == service_id).first()
    if not service:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Service not found")
    return service
