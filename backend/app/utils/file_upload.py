import os
import uuid
from fastapi import UploadFile, HTTPException, status
from app.config import settings

def validate_and_save_evidence(file: UploadFile) -> str:
    # Check filename and extension
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in settings.ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type '{ext}'. Allowed image extensions: {', '.join(settings.ALLOWED_IMAGE_EXTENSIONS)}"
        )
    
    # Read content to check file size
    content = file.file.read()
    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File size exceeds maximum allowed limit ({settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB)"
        )
    file.file.seek(0)
    
    # Generate secure unique filename
    unique_filename = f"evidence_{uuid.uuid4().hex[:12]}{ext}"
    dest_dir = os.path.join(settings.UPLOAD_DIR, "evidence")
    os.makedirs(dest_dir, exist_ok=True)
    dest_path = os.path.join(dest_dir, unique_filename)
    
    with open(dest_path, "wb") as f:
        f.write(content)
        
    return f"/uploads/evidence/{unique_filename}"

def validate_and_save_document(file: UploadFile) -> tuple[str, str, str]:
    filename = file.filename or ""
    ext = os.path.splitext(filename)[1].lower()
    
    if ext not in settings.ALLOWED_DOC_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid document type '{ext}'. Allowed extensions: {', '.join(settings.ALLOWED_DOC_EXTENSIONS)}"
        )
        
    content = file.file.read()
    if len(content) > settings.MAX_FILE_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Document size exceeds maximum limit ({settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)}MB)"
        )
    file.file.seek(0)
    
    clean_type = ext.replace(".", "")
    unique_filename = f"doc_{uuid.uuid4().hex[:12]}{ext}"
    dest_dir = os.path.join(settings.UPLOAD_DIR, "documents")
    os.makedirs(dest_dir, exist_ok=True)
    dest_path = os.path.join(dest_dir, unique_filename)
    
    with open(dest_path, "wb") as f:
        f.write(content)
        
    return unique_filename, clean_type, dest_path
