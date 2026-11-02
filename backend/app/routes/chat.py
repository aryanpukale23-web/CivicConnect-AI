import time
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import User, Conversation, Message, QueryLog, Feedback
from app.schemas.schemas import (
    ChatRequest, ChatResponse, ConversationResponse, MessageResponse,
    FeedbackCreate, FeedbackResponse
)
from app.utils.security import get_current_user
from app.ai.chatbot import generate_ai_response

router = APIRouter(prefix="/chat", tags=["Chat"])

@router.post("", response_model=ChatResponse)
def handle_chat_query(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    start_time = time.time()
    
    # 1. Resolve or create conversation
    conv = None
    if request.conversation_id:
        conv = db.query(Conversation).filter(
            Conversation.id == request.conversation_id,
            Conversation.user_id == current_user.id
        ).first()
        
    if not conv:
        # Title conversation from first 5 words of query
        words = request.message.strip().split()
        title_snippet = " ".join(words[:5])
        if len(title_snippet) > 40:
            title_snippet = title_snippet[:37] + "..."
        conv = Conversation(
            user_id=current_user.id,
            title=title_snippet or "Civic Inquiry"
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)

    # 2. Record User Message
    user_msg = Message(
        conversation_id=conv.id,
        sender="user",
        message=request.message
    )
    db.add(user_msg)
    db.commit()
    db.refresh(user_msg)

    # 3. Determine effective area and language
    effective_area = request.area or current_user.area or "Shivaji Nagar"
    effective_lang = request.language or current_user.preferred_language or "en"

    # 4. Generate AI Response
    ai_result = generate_ai_response(
        db=db,
        query=request.message,
        user_area=effective_area,
        language=effective_lang
    )

    # 5. Record AI Message
    ai_msg = Message(
        conversation_id=conv.id,
        sender="ai",
        message=ai_result["reply"],
        intent=ai_result["intent"]
    )
    db.add(ai_msg)
    
    # 6. Record Query Log
    elapsed_ms = int((time.time() - start_time) * 1000)
    log = QueryLog(
        user_id=current_user.id,
        query=request.message,
        intent=ai_result["intent"],
        response_time_ms=elapsed_ms
    )
    db.add(log)
    db.commit()
    db.refresh(ai_msg)

    return {
        "conversation_id": conv.id,
        "user_message_id": user_msg.id,
        "ai_message_id": ai_msg.id,
        "reply": ai_result["reply"],
        "intent": ai_result["intent"],
        "detected_area": ai_result["detected_area"],
        "language": ai_result["language"],
        "sources": ai_result["sources"],
        "is_fallback": ai_result["is_fallback"],
        "suggested_questions": ai_result["suggested_questions"]
    }

@router.get("/conversations", response_model=List[ConversationResponse])
def list_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(Conversation.updated_at.desc())
        .all()
    )
    result = []
    for c in convs:
        count = db.query(Message).filter(Message.conversation_id == c.id).count()
        result.append({
            "id": c.id,
            "title": c.title,
            "created_at": c.created_at,
            "updated_at": c.updated_at,
            "messages_count": count
        })
    return result

@router.get("/conversations/{conversation_id}", response_model=List[MessageResponse])
def get_conversation_messages(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
        
    messages = db.query(Message).filter(Message.conversation_id == conversation_id).order_by(Message.created_at.asc()).all()
    results = []
    for m in messages:
        fb_dict = None
        if m.feedback:
            fb_dict = {
                "id": m.feedback.id,
                "rating": m.feedback.rating,
                "comment": m.feedback.comment
            }
        results.append({
            "id": m.id,
            "conversation_id": m.conversation_id,
            "sender": m.sender,
            "message": m.message,
            "intent": m.intent,
            "created_at": m.created_at,
            "feedback": fb_dict
        })
    return results

@router.delete("/conversations/{conversation_id}")
def delete_conversation(
    conversation_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == current_user.id
    ).first()
    if not conv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Conversation not found")
    db.delete(conv)
    db.commit()
    return {"message": "Conversation deleted successfully."}

@router.post("/feedback", response_model=FeedbackResponse)
def submit_feedback(
    fb_in: FeedbackCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    msg = db.query(Message).filter(Message.id == fb_in.message_id).first()
    if not msg:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Message not found")
        
    existing_fb = db.query(Feedback).filter(Feedback.message_id == fb_in.message_id).first()
    if existing_fb:
        existing_fb.rating = fb_in.rating
        existing_fb.comment = fb_in.comment
        db.commit()
        db.refresh(existing_fb)
        return existing_fb
        
    fb = Feedback(
        user_id=current_user.id,
        message_id=fb_in.message_id,
        rating=fb_in.rating,
        comment=fb_in.comment
    )
    db.add(fb)
    db.commit()
    db.refresh(fb)
    return fb
