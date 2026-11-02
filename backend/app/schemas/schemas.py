import datetime
from typing import Optional, List, Any, Dict
from pydantic import BaseModel, EmailStr, Field

# ----------------- User Schemas -----------------
class UserCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)
    area: Optional[str] = "Shivaji Nagar"
    preferred_language: Optional[str] = "en"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    name: Optional[str] = None
    area: Optional[str] = None
    preferred_language: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    area: str
    preferred_language: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ----------------- Chat Schemas -----------------
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    conversation_id: Optional[int] = None
    area: Optional[str] = None
    language: Optional[str] = "en"

class StructuredSource(BaseModel):
    title: str
    category: str
    details: Optional[str] = None
    contact: Optional[str] = None

class ChatResponse(BaseModel):
    conversation_id: int
    user_message_id: int
    ai_message_id: int
    reply: str
    intent: str
    detected_area: Optional[str] = None
    language: str
    sources: List[Dict[str, Any]] = []
    is_fallback: bool = False
    suggested_questions: List[str] = []

class MessageResponse(BaseModel):
    id: int
    conversation_id: int
    sender: str
    message: str
    intent: Optional[str] = None
    created_at: datetime.datetime
    feedback: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    title: str
    created_at: datetime.datetime
    updated_at: datetime.datetime
    messages_count: Optional[int] = 0

    class Config:
        from_attributes = True

# ----------------- Feedback Schemas -----------------
class FeedbackCreate(BaseModel):
    message_id: int
    rating: int = Field(..., ge=-1, le=1)  # 1 (helpful) or -1 (not helpful)
    comment: Optional[str] = None

class FeedbackResponse(BaseModel):
    id: int
    user_id: int
    message_id: int
    rating: int
    comment: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- Service & Schedule Schemas -----------------
class ScheduleResponse(BaseModel):
    id: int
    service_id: int
    area: str
    day: str
    start_time: str
    end_time: str
    details: str
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ScheduleCreate(BaseModel):
    service_id: int
    area: str
    day: str
    start_time: str
    end_time: str
    details: str

class ServiceCreate(BaseModel):
    category: str
    service_name: str
    description: str
    area: str
    contact_number: str
    working_hours: str
    website: Optional[str] = None

class ServiceUpdate(BaseModel):
    category: Optional[str] = None
    service_name: Optional[str] = None
    description: Optional[str] = None
    area: Optional[str] = None
    contact_number: Optional[str] = None
    working_hours: Optional[str] = None
    website: Optional[str] = None

class ServiceResponse(BaseModel):
    id: int
    category: str
    service_name: str
    description: str
    area: str
    contact_number: str
    working_hours: str
    website: Optional[str] = None
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class ServiceDetailResponse(ServiceResponse):
    schedules: List[ScheduleResponse] = []

# ----------------- Complaint Schemas -----------------
class ComplaintCreate(BaseModel):
    category: str
    title: str
    description: str
    location: str
    priority: Optional[str] = "MEDIUM"

class ComplaintStatusUpdate(BaseModel):
    status: str  # SUBMITTED, UNDER REVIEW, IN PROGRESS, RESOLVED
    admin_remarks: Optional[str] = None

class ComplaintResponse(BaseModel):
    id: int
    user_id: int
    user_name: Optional[str] = None
    category: str
    title: str
    description: str
    location: str
    image_path: Optional[str] = None
    priority: str
    status: str
    admin_remarks: Optional[str] = None
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- Announcement Schemas -----------------
class AnnouncementCreate(BaseModel):
    title: str
    description: str
    area: Optional[str] = "All Areas"
    priority: Optional[str] = "NORMAL"
    expires_at: Optional[datetime.datetime] = None

class AnnouncementUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    area: Optional[str] = None
    priority: Optional[str] = None
    expires_at: Optional[datetime.datetime] = None

class AnnouncementResponse(BaseModel):
    id: int
    title: str
    description: str
    area: str
    priority: str
    created_at: datetime.datetime
    expires_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# ----------------- Document Schemas -----------------
class DocumentResponse(BaseModel):
    id: int
    admin_id: Optional[int] = None
    filename: str
    file_type: str
    title: Optional[str] = None
    chunks_count: Optional[int] = 0
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- Notification Schemas -----------------
class NotificationResponse(BaseModel):
    id: int
    user_id: int
    title: str
    message: str
    is_read: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

# ----------------- Analytics Schemas -----------------
class AnalyticsResponse(BaseModel):
    total_users: int
    total_queries: int
    total_complaints: int
    open_complaints: int
    resolved_complaints: int
    queries_by_category: List[Dict[str, Any]]
    complaints_by_category: List[Dict[str, Any]]
    complaint_status_distribution: List[Dict[str, Any]]
    daily_queries: List[Dict[str, Any]]
    feedback_distribution: Dict[str, int]
    recent_activity: List[Dict[str, Any]]
