# Denis Chamkaga Platform – REST API Documentation

Base URL: `http://localhost:5000/api` (Production: `https://denischamkaga.com/api`)

---

## 1. Authentication Endpoints (`/api/auth`)

### `POST /auth/login`
Authenticates a user and returns a Bearer JWT token.
- **Request Body**: `{ "email": "denis@denischamkaga.com", "password": "Denis@Platform2025" }`
- **Response**: `{ "success": true, "token": "jwt...", "refreshToken": "..." }`

### `POST /auth/refresh`
Refreshes an expired access token using a valid refresh token.

---

## 2. Public Content Endpoints

### `GET /projects`
Fetches all published portfolio projects with pagination & category filtering.

### `POST /contacts`
Submits a public contact form inquiry (creates a new lead and emits an AI EventBus notification).

### `POST /ai/chat`
Sends a prompt message to Mary AI.
- **Request Body**: `{ "message": "Tell me about retail POS solutions", "sessionId": "sess_123" }`
- **Response**: `{ "reply": "...", "confidenceScore": 89, "sourcesCited": [...] }`

---

## 3. Administrative & Operations Endpoints (`/api/admin`)

Requires `Authorization: Bearer <token>` header.

### `GET /admin/operations/health`
Returns 4-tier health report and status of 8 subsystems (Backend, Frontend, DB, Redis, Storage, AI, Email, Queue).

### `GET /admin/operations/metrics/infra`
Returns real CPU cores, model, hardware usage %, and heap memory allocation.

### `POST /admin/operations/backup`
Triggers an immediate automated PostgreSQL backup.
