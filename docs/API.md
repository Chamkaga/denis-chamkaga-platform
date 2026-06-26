# API Specification

> Denis Chamkaga Portfolio & AI Business Platform
> RESTful API Documentation

---

## 1. API Conventions

| Property | Convention |
|----------|-----------|
| Base URL | `/api/v1` |
| Format | JSON |
| Authentication | Bearer JWT in `Authorization` header |
| Pagination | `?page=1&limit=20` |
| Sorting | `?sort=created_at&order=desc` |
| Filtering | `?status=published&category=tech` |
| Error Format | `{ success: false, error: { code, message, details? } }` |
| Success Format | `{ success: true, data: T, meta?: { page, limit, total } }` |

### HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Success |
| 201 | Created |
| 204 | No Content (successful delete) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 409 | Conflict (duplicate resource) |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests (rate limit) |
| 500 | Internal Server Error |

---

## 2. Authentication Endpoints

### POST `/api/v1/auth/login`

Login with email and password.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Admin email |
| password | string | Yes | Account password |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": { "id", "email", "firstName", "lastName", "role" },
    "accessToken": "jwt...",
    "refreshToken": "jwt..."
  }
}
```

### POST `/api/v1/auth/refresh`

Refresh access token.

| Field | Type | Required |
|-------|------|----------|
| refreshToken | string | Yes |

### POST `/api/v1/auth/logout`

Invalidate refresh token. **Auth required.**

### GET `/api/v1/auth/me`

Get current user profile. **Auth required.**

### PUT `/api/v1/auth/password`

Change password. **Auth required.**

| Field | Type | Required |
|-------|------|----------|
| currentPassword | string | Yes |
| newPassword | string | Yes |

---

## 3. Projects Endpoints

### GET `/api/v1/projects`

List all projects. **Public.**

| Query Param | Type | Default | Description |
|-------------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 12 | Items per page |
| category | string | — | Filter by category |
| status | string | — | Filter by status |
| featured | boolean | — | Featured only |
| sort | string | display_order | Sort field |
| order | string | asc | Sort direction |

### GET `/api/v1/projects/:slug`

Get single project by slug. **Public.**

### POST `/api/v1/projects`

Create project. **Auth required (admin).**

### PUT `/api/v1/projects/:id`

Update project. **Auth required (admin).**

### DELETE `/api/v1/projects/:id`

Soft delete project. **Auth required (admin).**

### PATCH `/api/v1/projects/:id/order`

Update display order. **Auth required (admin).**

---

## 4. Gallery Endpoints

### GET `/api/v1/gallery`

List gallery items. **Public.**

| Query Param | Type | Default |
|-------------|------|---------|
| page | number | 1 |
| limit | number | 20 |
| category | string | — |

### GET `/api/v1/gallery/:id`

Get single gallery item. **Public.**

### POST `/api/v1/gallery`

Create gallery item. **Auth required (admin).** Multipart form data for image upload.

### PUT `/api/v1/gallery/:id`

Update gallery item. **Auth required (admin).**

### DELETE `/api/v1/gallery/:id`

Delete gallery item. **Auth required (admin).**

---

## 5. Services Endpoints

### GET `/api/v1/services`

List all services. **Public.**

### GET `/api/v1/services/:slug`

Get single service by slug. **Public.**

### POST `/api/v1/services`

Create service. **Auth required (admin).**

### PUT `/api/v1/services/:id`

Update service. **Auth required (admin).**

### DELETE `/api/v1/services/:id`

Delete service. **Auth required (admin).**

---

## 6. Experience Endpoints

### GET `/api/v1/experiences`

List career timeline. **Public.** Sorted by start_date descending.

### POST `/api/v1/experiences`

Create experience entry. **Auth required (admin).**

### PUT `/api/v1/experiences/:id`

Update experience entry. **Auth required (admin).**

### DELETE `/api/v1/experiences/:id`

Delete experience entry. **Auth required (admin).**

---

## 7. Education Endpoints

### GET `/api/v1/education`

List education entries. **Public.**

### POST `/api/v1/education`

Create education entry. **Auth required (admin).**

### PUT `/api/v1/education/:id`

Update education entry. **Auth required (admin).**

### DELETE `/api/v1/education/:id`

Delete education entry. **Auth required (admin).**

---

## 8. Certificates Endpoints

### GET `/api/v1/certificates`

List certificates. **Public.**

### POST `/api/v1/certificates`

Create certificate. **Auth required (admin).**

### PUT `/api/v1/certificates/:id`

Update certificate. **Auth required (admin).**

### DELETE `/api/v1/certificates/:id`

Delete certificate. **Auth required (admin).**

---

## 9. Testimonials Endpoints

### GET `/api/v1/testimonials`

List testimonials. **Public.** Optionally filter `?featured=true`.

### POST `/api/v1/testimonials`

Create testimonial. **Auth required (admin).**

### PUT `/api/v1/testimonials/:id`

Update testimonial. **Auth required (admin).**

### DELETE `/api/v1/testimonials/:id`

Delete testimonial. **Auth required (admin).**

---

## 10. Blog Endpoints

### GET `/api/v1/blog`

List published blog posts. **Public.**

| Query Param | Type | Default |
|-------------|------|---------|
| page | number | 1 |
| limit | number | 10 |
| category | string | — |
| tag | string | — |
| search | string | — |
| featured | boolean | — |

### GET `/api/v1/blog/:slug`

Get single post by slug. **Public.** Increments view count.

### GET `/api/v1/blog/categories`

List all blog categories. **Public.**

### GET `/api/v1/blog/tags`

List all blog tags. **Public.**

### POST `/api/v1/blog`

Create blog post. **Auth required (admin).**

### PUT `/api/v1/blog/:id`

Update blog post. **Auth required (admin).**

### DELETE `/api/v1/blog/:id`

Soft delete blog post. **Auth required (admin).**

### PATCH `/api/v1/blog/:id/publish`

Publish a draft post. **Auth required (admin).**

---

## 11. AI Chat Endpoints

### POST `/api/v1/ai/chat`

Send a message to the AI assistant. **Public.**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | User message |
| sessionId | string | No | Existing session ID |
| language | string | No | en or sw (default: en) |

**Response (200):**
```json
{
  "success": true,
  "data": {
    "sessionId": "...",
    "response": "AI response text",
    "intent": "service_inquiry",
    "confidence": 0.87,
    "suggestions": ["Tell me more about web development", "Book a consultation"],
    "leadScore": 45
  }
}
```

### GET `/api/v1/ai/sessions/:sessionId`

Get chat history for a session. **Public (session-scoped).**

### POST `/api/v1/ai/sessions/:sessionId/end`

End a chat session. **Public.**

### GET `/api/v1/ai/sessions`

List all chat sessions. **Auth required (admin).**

### GET `/api/v1/ai/analytics`

Get AI usage analytics. **Auth required (admin).**

---

## 12. Contact Endpoints

### POST `/api/v1/contact`

Submit contact form. **Public.** Rate limited.

| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| email | string | Yes |
| phone | string | No |
| subject | string | No |
| message | string | Yes |

### GET `/api/v1/messages`

List contact messages. **Auth required (admin).**

### GET `/api/v1/messages/:id`

Get single message. **Auth required (admin).** Marks as read.

### DELETE `/api/v1/messages/:id`

Delete message. **Auth required (admin).**

---

## 13. Lead Endpoints

### GET `/api/v1/leads`

List all leads. **Auth required (admin).**

| Query Param | Type | Default |
|-------------|------|---------|
| page | number | 1 |
| limit | number | 20 |
| status | string | — |
| temperature | string | — |
| source | string | — |
| sort | string | created_at |
| order | string | desc |

### GET `/api/v1/leads/:id`

Get single lead with history. **Auth required (admin).**

### PUT `/api/v1/leads/:id`

Update lead status/notes. **Auth required (admin).**

### DELETE `/api/v1/leads/:id`

Delete lead. **Auth required (admin).**

### GET `/api/v1/leads/analytics`

Lead funnel analytics. **Auth required (admin).**

---

## 14. Booking Endpoints

### GET `/api/v1/appointments`

List appointments. **Auth required (admin).**

### POST `/api/v1/appointments`

Create appointment request. **Public.** Rate limited.

| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| email | string | Yes |
| phone | string | No |
| purpose | string | Yes |
| preferredDate | string (ISO) | Yes |
| preferredTime | string | Yes |
| notes | string | No |

### PUT `/api/v1/appointments/:id`

Update appointment (confirm/cancel). **Auth required (admin).**

### DELETE `/api/v1/appointments/:id`

Delete appointment. **Auth required (admin).**

---

## 15. Investor Endpoints

### POST `/api/v1/investors`

Submit investor inquiry. **Public.** Rate limited.

| Field | Type | Required |
|-------|------|----------|
| name | string | Yes |
| email | string | Yes |
| phone | string | No |
| company | string | No |
| interestType | string | Yes |
| message | string | Yes |

### GET `/api/v1/investors`

List investor inquiries. **Auth required (admin).**

### PUT `/api/v1/investors/:id`

Update investor request status. **Auth required (admin).**

---

## 16. Settings Endpoints

### GET `/api/v1/settings`

Get all public site settings. **Public (filtered).**

### GET `/api/v1/settings/all`

Get all settings. **Auth required (admin).**

### PUT `/api/v1/settings/:key`

Update setting value. **Auth required (admin).**

### PUT `/api/v1/settings/bulk`

Bulk update settings. **Auth required (admin).**

---

## 17. Analytics Endpoints

### GET `/api/v1/analytics/dashboard`

Dashboard summary stats. **Auth required (admin).**

**Response includes:** total visitors, total leads, conversion rate, recent activity, popular pages.

### GET `/api/v1/analytics/visitors`

Visitor analytics. **Auth required (admin).**

### GET `/api/v1/analytics/leads`

Lead analytics. **Auth required (admin).**

---

## 18. Media Endpoints

### POST `/api/v1/media/upload`

Upload file. **Auth required (admin).** Multipart form data.

### GET `/api/v1/media`

List uploaded files. **Auth required (admin).**

### DELETE `/api/v1/media/:id`

Delete uploaded file. **Auth required (admin).**

---

## 19. User Management Endpoints

### GET `/api/v1/users`

List admin users. **Auth required (admin).**

### POST `/api/v1/users`

Create admin user. **Auth required (admin).**

### PUT `/api/v1/users/:id`

Update user. **Auth required (admin).**

### DELETE `/api/v1/users/:id`

Deactivate user. **Auth required (admin).**

---

## 20. Audit Log Endpoints

### GET `/api/v1/audit-logs`

List audit logs. **Auth required (admin).**

| Query Param | Type | Default |
|-------------|------|---------|
| page | number | 1 |
| limit | number | 50 |
| userId | string | — |
| action | string | — |
| resource | string | — |
| from | string (ISO) | — |
| to | string (ISO) | — |

---

## 21. Notification Endpoints

### GET `/api/v1/notifications`

List notifications for current user. **Auth required.**

### PATCH `/api/v1/notifications/:id/read`

Mark notification as read. **Auth required.**

### PATCH `/api/v1/notifications/read-all`

Mark all notifications as read. **Auth required.**
