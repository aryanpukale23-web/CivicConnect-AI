import os
from typing import List
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CivicConnect AI"
    TAGLINE: str = "Your AI Assistant for Smarter Communities."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./civicconnect.db")
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "civicconnect-super-secret-jwt-key-for-local-development-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # AI Layer
    AI_API_KEY: str = os.getenv("AI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-2.0-flash")
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    
    # Uploads
    UPLOAD_DIR: str = os.path.join(os.path.dirname(os.path.dirname(__file__)), "uploads")
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024  # 10 MB
    ALLOWED_IMAGE_EXTENSIONS: set = {".jpg", ".jpeg", ".png", ".webp"}
    ALLOWED_DOC_EXTENSIONS: set = {".pdf", ".txt", ".docx"}
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

    class Config:
        case_sensitive = True
        env_file = ".env"
        extra = "allow"

settings = Settings()
os.makedirs(os.path.join(settings.UPLOAD_DIR, "evidence"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_DIR, "documents"), exist_ok=True)
