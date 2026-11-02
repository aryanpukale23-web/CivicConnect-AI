from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.session import get_db
from app.models.models import Schedule
from app.schemas.schemas import ScheduleResponse

router = APIRouter(prefix="/schedules", tags=["Schedules"])

@router.get("", response_model=List[ScheduleResponse])
def list_schedules(
    area: Optional[str] = None,
    service_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Schedule)
    if service_id:
        query = query.filter(Schedule.service_id == service_id)
    if area and area != "All Areas":
        query = query.filter(or_(Schedule.area.ilike(f"%{area}%"), Schedule.area == "All Areas"))
    return query.order_by(Schedule.area.asc(), Schedule.day.asc()).all()

@router.get("/{service_id}", response_model=List[ScheduleResponse])
def get_service_schedules(service_id: int, db: Session = Depends(get_db)):
    return db.query(Schedule).filter(Schedule.service_id == service_id).all()
