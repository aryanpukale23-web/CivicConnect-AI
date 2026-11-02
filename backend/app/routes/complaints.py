from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.database.session import get_db
from app.models.models import Complaint, User, Notification
from app.schemas.schemas import ComplaintResponse, ComplaintStatusUpdate
from app.utils.security import get_current_user
from app.utils.file_upload import validate_and_save_evidence

router = APIRouter(prefix="/complaints", tags=["Complaints"])

@router.post("", response_model=ComplaintResponse)
def report_complaint(
    category: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    location: str = Form(...),
    priority: str = Form("MEDIUM"),
    image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    image_url = None
    if image and image.filename:
        image_url = validate_and_save_evidence(image)
        
    complaint = Complaint(
        user_id=current_user.id,
        category=category,
        title=title,
        description=description,
        location=location,
        image_path=image_url,
        priority=priority,
        status="SUBMITTED"
    )
    db.add(complaint)
    db.commit()
    db.refresh(complaint)
    
    # Notify user of successful submission
    notif = Notification(
        user_id=current_user.id,
        title="Complaint Submitted",
        message=f"Your grievance '{title}' has been registered with ID #{complaint.id}."
    )
    db.add(notif)
    db.commit()
    
    res = ComplaintResponse.model_validate(complaint)
    res.user_name = current_user.name
    return res

@router.get("", response_model=List[ComplaintResponse])
def list_complaints(
    category: Optional[str] = None,
    status_filter: Optional[str] = None,
    location: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Complaint, User.name).join(User, Complaint.user_id == User.id)
    
    # Citizens only see their own complaints; Admins see all
    if current_user.role != "admin":
        query = query.filter(Complaint.user_id == current_user.id)
        
    if category and category != "All":
        query = query.filter(Complaint.category == category)
    if status_filter and status_filter != "All":
        query = query.filter(Complaint.status == status_filter)
    if location and location != "All Areas":
        query = query.filter(Complaint.location.ilike(f"%{location}%"))
        
    complaints = query.order_by(Complaint.created_at.desc()).all()
    
    results = []
    for comp, u_name in complaints:
        item = ComplaintResponse.model_validate(comp)
        item.user_name = u_name
        results.append(item)
    return results

@router.get("/{complaint_id}", response_model=ComplaintResponse)
def get_complaint(
    complaint_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    comp_row = (
        db.query(Complaint, User.name)
        .join(User, Complaint.user_id == User.id)
        .filter(Complaint.id == complaint_id)
        .first()
    )
    if not comp_row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
        
    comp, u_name = comp_row
    if current_user.role != "admin" and comp.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized access to this complaint")
        
    item = ComplaintResponse.model_validate(comp)
    item.user_name = u_name
    return item

@router.put("/{complaint_id}", response_model=ComplaintResponse)
def update_complaint_status(
    complaint_id: int,
    update_data: ComplaintStatusUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Only administrators can update complaint status")
        
    comp = db.query(Complaint).filter(Complaint.id == complaint_id).first()
    if not comp:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Complaint not found")
        
    valid_statuses = ["SUBMITTED", "UNDER REVIEW", "IN PROGRESS", "RESOLVED"]
    if update_data.status not in valid_statuses:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid status. Must be one of {valid_statuses}")
        
    comp.status = update_data.status
    if update_data.admin_remarks is not None:
        comp.admin_remarks = update_data.admin_remarks
        
    # Trigger in-app notification for the citizen
    notif = Notification(
        user_id=comp.user_id,
        title=f"Complaint #{comp.id} Status: {comp.status}",
        message=f"Your complaint '{comp.title}' has been moved to {comp.status}. Remarks: {update_data.admin_remarks or 'No remarks'}"
    )
    db.add(notif)
    db.commit()
    db.refresh(comp)
    
    u = db.query(User).filter(User.id == comp.user_id).first()
    item = ComplaintResponse.model_validate(comp)
    item.user_name = u.name if u else "Citizen"
    return item
