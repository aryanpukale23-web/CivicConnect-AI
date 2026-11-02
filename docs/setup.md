# CivicConnect AI – Setup Guide

## Quick Start (Standalone Local Development)

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
python -m app.database.seed
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
Swagger UI documentation will be available at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Production Deployment with Docker Compose

Ensure Docker and Docker Compose are installed:
```bash
docker-compose up --build -d
```
This deploys:
1. **PostgreSQL 16** with **pgvector** enabled on port 5432.
2. **FastAPI Backend** on port 8000.
3. **Next.js Frontend** on port 3000.

Default pre-seeded accounts:
- **Administrator**: `admin@civicconnect.org` / `Admin@123`
- **Citizen**: `citizen@civicconnect.org` / `Citizen@123`
