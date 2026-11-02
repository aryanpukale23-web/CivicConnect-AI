import os
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import Document, DocumentChunk, User
from app.schemas.schemas import DocumentResponse
from app.utils.security import get_current_admin_user
from app.utils.file_upload import validate_and_save_document
from app.ai.rag import index_document

router = APIRouter(prefix="/documents", tags=["Documents & RAG"])

@router.post("", response_model=DocumentResponse)
def upload_civic_document(
    file: UploadFile = File(...),
    title: Optional[str] = Form(None),
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    unique_filename, file_type, file_path = validate_and_save_document(file)
    
    doc = Document(
        admin_id=current_admin.id,
        filename=file.filename or unique_filename,
        file_type=file_type,
        file_path=file_path,
        title=title or file.filename or "Civic Notice"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    # Run RAG text extraction, chunking, and embedding index
    num_chunks = index_document(db, doc.id)
    
    return {
        "id": doc.id,
        "admin_id": doc.admin_id,
        "filename": doc.filename,
        "file_type": doc.file_type,
        "title": doc.title,
        "chunks_count": num_chunks,
        "created_at": doc.created_at
    }

@router.get("", response_model=List[DocumentResponse])
def list_documents(
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    docs = db.query(Document).order_by(Document.created_at.desc()).all()
    results = []
    for d in docs:
        c_count = db.query(DocumentChunk).filter(DocumentChunk.document_id == d.id).count()
        results.append({
            "id": d.id,
            "admin_id": d.admin_id,
            "filename": d.filename,
            "file_type": d.file_type,
            "title": d.title,
            "chunks_count": c_count,
            "created_at": d.created_at
        })
    return results

@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    current_admin: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
        
    if os.path.exists(doc.file_path):
        try:
            os.remove(doc.file_path)
        except Exception:
            pass
            
    db.delete(doc)
    db.commit()
    return {"message": "Document and all vector chunks deleted successfully."}
