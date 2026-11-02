import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def utcnow():
    return datetime.datetime.now(datetime.timezone.utc)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(50), default="citizen", nullable=False)  # "citizen" or "admin"
    preferred_language = Column(String(10), default="en", nullable=False)  # "en", "hi", "mr"
    area = Column(String(100), default="Shivaji Nagar", nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    conversations = relationship("Conversation", back_populates="user", cascade="all, delete-orphan")
    complaints = relationship("Complaint", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    feedback = relationship("Feedback", back_populates="user", cascade="all, delete-orphan")
    query_logs = relationship("QueryLog", back_populates="user")
    uploaded_documents = relationship("Document", back_populates="admin")

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), default="Civic Inquiry", nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="conversations")
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan", order_by="Message.created_at")

class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id", ondelete="CASCADE"), nullable=False)
    sender = Column(String(20), nullable=False)  # "user" or "ai"
    message = Column(Text, nullable=False)
    intent = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    conversation = relationship("Conversation", back_populates="messages")
    feedback = relationship("Feedback", back_populates="message", uselist=False, cascade="all, delete-orphan")

class Service(Base):
    __tablename__ = "services"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), index=True, nullable=False)  # Garbage, Bus Transport, Water, Electricity, Emergency, Healthcare, Municipal Offices
    service_name = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    area = Column(String(100), index=True, nullable=False)
    contact_number = Column(String(50), nullable=False)
    working_hours = Column(String(100), nullable=False)
    website = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    schedules = relationship("Schedule", back_populates="service", cascade="all, delete-orphan")

class Schedule(Base):
    __tablename__ = "schedules"

    id = Column(Integer, primary_key=True, index=True)
    service_id = Column(Integer, ForeignKey("services.id", ondelete="CASCADE"), nullable=False)
    area = Column(String(100), index=True, nullable=False)
    day = Column(String(50), nullable=False)
    start_time = Column(String(50), nullable=False)
    end_time = Column(String(50), nullable=False)
    details = Column(Text, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    service = relationship("Service", back_populates="schedules")

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category = Column(String(50), nullable=False)  # Garbage, Road/Pothole, Water, Electricity, Street Light, Drainage, Public Safety, Other
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    image_path = Column(String(255), nullable=True)
    priority = Column(String(20), default="MEDIUM", nullable=False)  # LOW, MEDIUM, HIGH, URGENT
    status = Column(String(30), default="SUBMITTED", nullable=False)  # SUBMITTED, UNDER REVIEW, IN PROGRESS, RESOLVED
    admin_remarks = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow, nullable=False)

    user = relationship("User", back_populates="complaints")

class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    area = Column(String(100), index=True, nullable=False)  # Specific area or "All Areas"
    priority = Column(String(20), default="NORMAL", nullable=False)  # NORMAL, IMPORTANT, CRITICAL, EMERGENCY
    created_at = Column(DateTime, default=utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False)  # pdf, txt, docx
    file_path = Column(String(500), nullable=False)
    title = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    admin = relationship("User", back_populates="uploaded_documents")
    chunks = relationship("DocumentChunk", back_populates="document", cascade="all, delete-orphan")

class DocumentChunk(Base):
    __tablename__ = "document_chunks"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id", ondelete="CASCADE"), nullable=False)
    chunk_text = Column(Text, nullable=False)
    embedding = Column(Text, nullable=False)  # Stored as JSON string of float array for portable SQLite + Postgres
    chunk_index = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    document = relationship("Document", back_populates="chunks")

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message_id = Column(Integer, ForeignKey("messages.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)  # 1 for helpful (👍), -1 for not helpful (👎)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    user = relationship("User", back_populates="feedback")
    message = relationship("Message", back_populates="feedback")

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    user = relationship("User", back_populates="notifications")

class QueryLog(Base):
    __tablename__ = "query_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    query = Column(Text, nullable=False)
    intent = Column(String(50), nullable=False)
    response_time_ms = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=utcnow, nullable=False)

    user = relationship("User", back_populates="query_logs")
