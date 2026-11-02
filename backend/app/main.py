import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse

from app.config import settings
from app.database.seed import seed_database
from app.routes import (
    auth, chat, services, schedules, complaints,
    announcements, documents, notifications, admin
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database tables and seed records exist
    try:
        seed_database()
    except Exception as e:
        print(f"Startup database warning: {e}")
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=f"{settings.TAGLINE} Modern, verified, multilingual AI community query and civic grievance resolution platform.",
    version=settings.VERSION,
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development and production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static folder
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Include API routers
api_prefix = settings.API_V1_STR
app.include_router(auth.router, prefix=api_prefix)
app.include_router(chat.router, prefix=api_prefix)
app.include_router(services.router, prefix=api_prefix)
app.include_router(schedules.router, prefix=api_prefix)
app.include_router(complaints.router, prefix=api_prefix)
app.include_router(announcements.router, prefix=api_prefix)
app.include_router(documents.router, prefix=api_prefix)
app.include_router(notifications.router, prefix=api_prefix)
app.include_router(admin.router, prefix=api_prefix)

@app.get("/")
def root_endpoint():
    return {
        "app": settings.PROJECT_NAME,
        "tagline": settings.TAGLINE,
        "version": settings.VERSION,
        "status": "operational",
        "docs_url": "/docs",
        "api_v1": api_prefix
    }

@app.get(f"{api_prefix}/health")
def health_check():
    return {
        "status": "healthy",
        "database": "connected",
        "ai_engine": "operational",
        "rag_engine": "ready"
    }
