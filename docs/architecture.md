# CivicConnect AI – System Architecture

## Overview
CivicConnect AI is an enterprise-grade civic assistance and community query intelligence platform designed for municipal corporations and local communities. It bridges the gap between citizens and local governance by combining natural language intent recognition, verified civic knowledge retrieval, Retrieval-Augmented Generation (RAG) over municipal circulars, and structured grievance lifecycle management.

```
+-------------------------------------------------------------+
|               Citizen & Admin Web Clients                   |
|       (Next.js 14, React 18, Tailwind CSS, Recharts)        |
+-------------------------------------------------------------+
                               |  HTTP/REST + JWT
                               v
+-------------------------------------------------------------+
|                   FastAPI API Gateway                       |
|  - Authentication & RBAC (Citizen vs Admin)                 |
|  - Rate Limiting, File Validation, Session Management       |
+-------------------------------------------------------------+
         |                                           |
         v                                           v
+-----------------------+                 +---------------------+
|  Civic Domain Services|                 |  AI & RAG Engine    |
| - Complaints Engine   |                 | - 13-Intent Engine  |
| - Schedule Directory  |                 | - Multilingual (MR, |
| - Helplines & Services|                 |   HI, EN)           |
| - Notifications Bus   |                 | - Vector Cosine Sim |
+-----------------------+                 | - Smart Fallback    |
         |                                +---------------------+
         +--------------------+----------------------+
                              |
                              v
+-------------------------------------------------------------+
|                     Data Persistence                        |
|  - Production: PostgreSQL 16 + pgvector                     |
|  - Local/Dev: SQLite + NumPy Vector Projection Engine       |
+-------------------------------------------------------------+
```

## AI Intent Engine
The system classifies incoming queries into one of 13 civic categories:
1. `GARBAGE`: Waste collection schedules, segregation rules, pickup slots.
2. `BUS_TRANSPORT`: Municipal bus timetables, routes, stops, frequencies.
3. `WATER`: Pipeline repairs, supply timings, water cut announcements.
4. `ELECTRICITY`: Power outage notices, board contact, maintenance.
5. `EMERGENCY`: Police (100), Fire (101), Ambulance (108), SOS helplines.
6. `HEALTHCARE`: Government hospitals, clinics, maternity homes.
7. `ROAD`: Potholes, broken roads, resurfacing requests.
8. `STREET_LIGHT`: Broken lights, dark streets, pole issues.
9. `CIVIC_COMPLAINT`: Grievance submission and status inquiries.
10. `PUBLIC_SERVICE`: Ward offices, certificates, property tax desks.
11. `ANNOUNCEMENT`: Active municipal notices and circulars.
12. `DOCUMENT_QUERY`: Grounded Q&A against uploaded civic circulars (PDF/DOCX/TXT).
13. `GENERAL_QUERY`: Greetings and navigation assistance.

## Zero Hallucination Principle
Under no circumstance does the AI generate fabricated timings, contact numbers, or civic procedures. If an inquiry cannot be answered with high confidence from verified schedules or uploaded documents, the engine executes the **Smart Fallback Protocol**, indicating that verified data is currently absent and providing the official municipal helpline.
