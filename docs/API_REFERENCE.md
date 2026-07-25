# Denis Business Platform — Complete API Reference Specification

```
Version: 1.0.0
Last Updated: 2026-07-25
Author: Principal Backend API Architect
Reviewed By: Denis Chamkaga Backend Engineering Team
Approval Status: APPROVED (Official Project Standard)
Related Documents: [ADMIN_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/ADMIN_ARCHITECTURE.md), [DATABASE_SCHEMA.md](file:///d:/Projects/denis-chamkaga-platform/docs/DATABASE_SCHEMA.md), [README.md](file:///d:/Projects/denis-chamkaga-platform/docs/README.md)
```

---

## 1. Overview & Base Configuration

- **Base API URL:** `http://localhost:5000/api` (Configurable via `VITE_API_URL`)
- **Protocol:** HTTP/HTTPS + Server-Sent Events (SSE) + WebRTC SDP Signaling
- **Authentication Scheme:** `Bearer <JWT_ACCESS_TOKEN>` in HTTP `Authorization` header
- **Content Type:** `application/json` (except `/api/ai/attachments` which uses `multipart/form-data`)

---

## 2. Authentication & Token Management (`/api/auth`)

| Endpoint Route | HTTP Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/auth/login` | `POST` | Public | Authenticates admin credentials, returns access & refresh tokens |
| `/auth/refresh` | `POST` | Public | Exposes token refresh endpoint using valid refresh token |
| `/auth/logout` | `POST` | Bearer JWT | Invalidates user session and revokes refresh token |
| `/auth/me` | `GET` | Bearer JWT | Returns current authenticated user profile and roles |

---

## 3. Public & Visitor Endpoints (`/api/public`, `/api/ai`)

| Endpoint Route | HTTP Method | Auth Required | Description |
| :--- | :--- | :--- | :--- |
| `/contact` | `POST` | Public | Submits visitor contact/lead record (`publicApi.submitContact`) |
| `/ai/chat/stream` | `POST` | Public | Server-Sent Events (SSE) streaming chat endpoint for Mary persona |
| `/ai/chat/history/:sessionId`| `GET` | Public | Fetches historical messages for an active chat session |
| `/ai/attachments` | `POST` | Public | Uploads document/image attachment (Max 10MB) |
| `/ai/webrtc/session` | `GET` | Public | Checks WebRTC voice calling status & availability |
| `/ai/webrtc/candidate` | `POST` | Public | Posts WebRTC ICE candidate signaling message |
| `/ai/webrtc/log` | `POST` | Public | Logs completed WebRTC audio call session |
| `/public/docs/:token` | `GET` | Public | Fetches public tokenized quotation or invoice document |

---

## 4. Admin Management Endpoints (`/api/admin`)

### 4.1 CMS & Content CRUD (`/api/admin/*`)
- `GET / POST / PUT / DELETE /admin/projects` — Projects management
- `GET / POST / PUT / DELETE /admin/services` — Services management
- `GET / POST / PUT / DELETE /admin/blog-posts` — Blog posts management
- `GET / POST / PUT / DELETE /admin/education` — Education records
- `GET / POST / PUT / DELETE /admin/certificates` — Certificates management
- `GET / POST / PUT / DELETE /admin/testimonials` — Testimonials management
- `GET / POST / PUT / DELETE /admin/gallery` — Gallery assets

### 4.2 Business Operations & CRM (`/api/admin/business/*`)
- `GET / POST / PUT / DELETE /admin/leads` — Lead management & conversion
- `GET / POST / PUT /admin/business/clients` — Organization clients
- `GET / POST /admin/business/consultations` — Consultations & appointments
- `GET / POST /admin/business/contracts` — Business contracts
- `GET / POST /admin/business/documents` — Shared client documents

### 4.3 Finance OS (`/api/admin/finance/*`)
- `GET / POST /admin/finance/quotations` — Create & manage quotations
- `POST /admin/finance/quotations/:id/email` — Email PDF quotation to client
- `GET / POST /admin/finance/invoices` — Create & manage invoices
- `POST /admin/finance/invoices/:id/payments` — Record invoice payments

### 4.4 AI Knowledge Ops & Governance (`/api/admin/ai-knowledge/*`)
- `GET / POST / PUT / DELETE /admin/ai-knowledge` — Knowledge base CRUD
- `GET /admin/ai-knowledge/health` — AI Knowledge health metrics
- `GET /admin/ai-knowledge/:id/versions` — Version history of knowledge entry
- `POST /admin/ai-knowledge/:id/restore/:versionId` — One-click version rollback
- `POST /admin/ai-knowledge/reindex` — Triggers vector re-indexing

---

## 5. Standard Error Format (RFC 7807)

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email address format provided.",
    "details": [
      { "field": "email", "issue": "Must be a valid RFC 5322 email string" }
    ]
  }
}
```
