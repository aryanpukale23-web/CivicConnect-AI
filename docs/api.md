# CivicConnect AI – REST API Documentation

Base URL: `/api`

## Authentication
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new citizen account | Public |
| `POST` | `/api/auth/login` | Login and receive Bearer JWT | Public |
| `POST` | `/api/auth/logout` | Revoke session | Authenticated |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Authenticated |
| `PUT` | `/api/auth/me` | Update name, area, or preferred language | Authenticated |

## AI Chat & Conversations
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/chat` | Send natural language query to AI engine | Authenticated |
| `GET` | `/api/chat/conversations` | List conversation threads | Authenticated |
| `GET` | `/api/chat/conversations/{id}` | Retrieve messages and feedback in thread | Authenticated |
| `DELETE` | `/api/chat/conversations/{id}` | Delete a conversation thread | Authenticated |
| `POST` | `/api/chat/feedback` | Submit thumbs up/down rating + comment | Authenticated |

## Civic Complaints
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/complaints` | Submit complaint with optional photo | Authenticated |
| `GET` | `/api/complaints` | Filter and list user or all complaints | Authenticated |
| `GET` | `/api/complaints/{id}` | View detailed complaint history | Authenticated |
| `PUT` | `/api/complaints/{id}` | Update complaint status + remarks | Admin Only |

## Services & Schedules
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/services` | Search and filter civic services | Public/Auth |
| `GET` | `/api/services/{id}` | View service details and schedules | Public/Auth |
| `GET` | `/api/schedules` | Filter garbage & bus schedules by area | Public/Auth |

## Announcements & Documents
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/announcements` | Retrieve active municipal notices | Public/Auth |
| `POST` | `/api/announcements` | Publish new municipal announcement | Admin Only |
| `POST` | `/api/documents` | Upload PDF/TXT/DOCX for RAG indexing | Admin Only |
| `GET` | `/api/documents` | List indexed documents and chunk count | Admin Only |

## Admin Analytics
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET` | `/api/admin/analytics` | High-level metrics for dashboard charts | Admin Only |
| `GET` | `/api/admin/users` | List registered citizens & administrators | Admin Only |
| `GET` | `/api/admin/feedback` | Review citizen feedback audit trail | Admin Only |
| `GET` | `/api/admin/query-logs` | Live query logs with response latency | Admin Only |
