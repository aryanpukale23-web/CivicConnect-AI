# CivicConnect AI

> **AI-Powered Community Query & Civic Assistance Platform**

CivicConnect AI is a full-stack web application that enables citizens to interact with an AI chatbot for local civic queries, report problems, track complaints, and receive community announcements — all in one place.

---

## Features

- **AI Chatbot** — 13-intent classifier (garbage, bus, water, emergency, healthcare, etc.) with multilingual support (English, Hindi, Marathi)
- **RAG Document Search** — Upload PDF/DOCX/TXT civic documents; chatbot answers questions from them
- **Complaint Management** — Submit, track, and receive notifications on civic complaints with photo evidence
- **Civic Services Directory** — Search 16+ services by category and area
- **Garbage & Bus Schedules** — Area-wise pickup and transit timetables
- **Community Announcements** — Priority-based notices from municipal admin
- **Admin Dashboard** — Analytics, Recharts visualizations, user management, complaint resolution
- **Multilingual** — EN / HI / MR response templates
- **Voice Input** — Browser Web Speech API integration
- **JWT Authentication** — Secure login/register for citizens and admins

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 · React 18 · TypeScript · Tailwind CSS · Recharts |
| Backend | FastAPI · Python 3.11+ · SQLAlchemy · Pydantic v2 |
| AI/NLP | Custom keyword intent classifier · Hash-projection embeddings (no API needed) |
| Database | SQLite (default) or PostgreSQL + pgvector (production) |
| Auth | JWT (PyJWT) · bcrypt password hashing |
| DevOps | Docker · Docker Compose |

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- (Optional) PostgreSQL 15+ with pgvector extension for production

### 1. Clone & Setup

```bash
git clone https://github.com/your-org/civicconnect-ai.git
cd civicconnect-ai
```

### 2. Backend

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # edit as needed
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

The server will auto-seed the database on first run.

### 3. Frontend

```bash
cd frontend
cp .env.local.example .env.local   # or create manually
npm install
npm run dev
```

Open http://localhost:3000

### 4. Docker Compose (full stack)

```bash
docker-compose up --build
```

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@civicconnect.org | Admin@123 |
| Citizen | citizen@civicconnect.org | Citizen@123 |
| Citizen 2 | rahul@civicconnect.org | Citizen@123 |

---

## Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=sqlite:///./civicconnect.db
SECRET_KEY=your-secret-key-min-32-chars
ACCESS_TOKEN_EXPIRE_MINUTES=1440
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=10
CORS_ORIGINS=http://localhost:3000
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

---

## Project Structure

```
civicconnect-ai/
├── backend/
│   ├── app/
│   │   ├── ai/            # Intent classifier, embeddings, RAG, chatbot
│   │   ├── database/      # SQLAlchemy session, seed data
│   │   ├── models/        # ORM models (11 tables)
│   │   ├── routes/        # FastAPI routers (9 modules)
│   │   ├── schemas/       # Pydantic request/response schemas
│   │   ├── utils/         # JWT security, file upload helpers
│   │   └── main.py        # FastAPI app entrypoint
│   ├── tests/             # 15 pytest tests
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js App Router pages
│   │   │   ├── admin/     # Admin-only pages
│   │   │   └── ...        # Citizen-facing pages
│   │   ├── components/    # Navbar, Footer, StatusBadge
│   │   └── lib/           # API client, auth context
│   └── Dockerfile
├── database/
│   ├── schema.sql         # PostgreSQL DDL
│   └── seed.sql           # PostgreSQL seed data
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── setup.md
└── docker-compose.yml
```

---

## API Overview

Base URL: `http://localhost:8000/api`

| Module | Endpoints |
|--------|-----------|
| Auth | `POST /auth/register`, `POST /auth/login`, `GET /auth/me` |
| Chat | `POST /chat`, `GET /chat/conversations`, `GET /chat/messages/{id}` |
| Services | `GET /services`, `GET /services/{id}` |
| Schedules | `GET /schedules` |
| Complaints | `POST /complaints`, `GET /complaints`, `PUT /complaints/{id}/status` |
| Announcements | `GET /announcements`, `POST /announcements` (admin) |
| Documents | `POST /documents/upload`, `GET /documents` |
| Notifications | `GET /notifications`, `PUT /notifications/{id}/read` |
| Admin | `GET /admin/analytics`, `GET /admin/users`, `GET /admin/feedback` |

Full API documentation: [`docs/api.md`](docs/api.md)

---

## Running Tests

```bash
cd backend
python -m pytest tests/ -v
```

All 15 tests should pass.

---

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for:
- System component diagram
- AI pipeline (intent → RAG → response)
- Database schema overview
- Authentication flow

---

## License

MIT License — Free for educational and non-commercial use.

---

*Built as an academic prototype demonstrating AI-powered civic engagement platforms.*
