from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.session import get_db
from app.models.models import Announcement, User
from app.schemas.schemas import AnnouncementCreate, AnnouncementUpdate, AnnouncementResponse
from app.utils.security import get_current_user, get_current_admin_user

router = APIRouter(prefix="/announcements", tags=["Announcements"])

@router.get("", response_model=List[AnnouncementResponse])
def list_announcements(
    area: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Announcement)
    if area and area != "All Areas":
        query = query.filter(or_(Announcement.area.ilike(f"%{area}%"), Announcement.area == "All Areas"))
    if priority and priority != "All":
        query = query.filter(Announcement.priority == priority)
    return query.order_by(Announcement.created_at.desc()).all()

@router.post("", response_model=AnnouncementResponse)
def create_announcement(
    ann_in: AnnouncementCreate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    ann = Announcement(
        title=ann_in.title,
        description=ann_in.description,
        area=ann_in.area or "All Areas",
        priority=ann_in.priority or "NORMAL",
        expires_at=ann_in.expires_at
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)
    return ann

@router.put("/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: int,
    update_in: AnnouncementUpdate,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    if update_in.title is not None:
        ann.title = update_in.title
    if update_in.description is not None:
        ann.description = update_in.description
    if update_in.area is not None:
        ann.area = update_in.area
    if update_in.priority is not None:
        ann.priority = update_in.priority
    if update_in.expires_at is not None:
        ann.expires_at = update_in.expires_at
    db.commit()
    db.refresh(ann)
    return ann

@router.delete("/{announcement_id}")
def delete_announcement(
    announcement_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    db.delete(ann)
    db.commit()
    return {"message": "Announcement deleted successfully."}
