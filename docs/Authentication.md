# Authentication & Authorization

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Overview

Authentication secures the Admin Panel. The public-facing portfolio does not require user authentication. The AI chat system uses anonymous session IDs.

| Property | Value |
|----------|-------|
| Strategy | JWT (JSON Web Tokens) |
| Password Hashing | bcrypt (12 salt rounds) |
| Access Token Lifetime | 15 minutes |
| Refresh Token Lifetime | 7 days |
| Token Storage (Client) | httpOnly cookies (preferred) or localStorage |
| Token Rotation | Refresh tokens are single-use and rotated |

---

## 2. Authentication Flow

### 2.1 Login

```
1. Client sends POST /api/v1/auth/login { email, password }
2. Server validates credentials against database
3. Server generates:
   - Access token (JWT, 15 min, contains userId, role)
   - Refresh token (JWT, 7 days, contains userId, tokenId)
4. Server stores refresh token hash in database
5. Server returns both tokens to client
6. Client stores tokens and includes access token in subsequent requests
```

### 2.2 Authenticated Request

```
1. Client sends request with header: Authorization: Bearer <accessToken>
2. Auth middleware extracts and validates JWT
3. If valid: request proceeds with req.user populated
4. If expired: client uses refresh token to get new access token
5. If invalid: 401 Unauthorized response
```

### 2.3 Token Refresh

```
1. Client sends POST /api/v1/auth/refresh { refreshToken }
2. Server validates refresh token
3. Server checks token exists in database (not revoked)
4. Server generates new access token AND new refresh token
5. Server invalidates old refresh token (rotation)
6. Server returns new token pair
```

### 2.4 Logout

```
1. Client sends POST /api/v1/auth/logout (with auth header)
2. Server invalidates refresh token in database
3. Client removes stored tokens
```

---

## 3. JWT Token Structure

### Access Token Payload

```json
{
  "sub": "user-cuid",
  "email": "denis@example.com",
  "role": "admin",
  "iat": 1719000000,
  "exp": 1719000900
}
```

### Refresh Token Payload

```json
{
  "sub": "user-cuid",
  "tokenId": "unique-token-id",
  "iat": 1719000000,
  "exp": 1719604800
}
```

---

## 4. Authorization

### 4.1 Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| admin | Full system access | All CRUD operations on all resources |
| editor | Content management | CRUD on content (projects, blog, gallery), read-only on leads and analytics |

### 4.2 Permission Matrix

| Resource | Admin | Editor | Public |
|----------|-------|--------|--------|
| Projects | CRUD | CRUD | Read |
| Gallery | CRUD | CRUD | Read |
| Blog | CRUD | CRUD | Read |
| Services | CRUD | CRUD | Read |
| Certificates | CRUD | CRUD | Read |
| Experiences | CRUD | CRUD | Read |
| Testimonials | CRUD | CRUD | Read |
| Leads | CRUD | Read | — |
| Messages | CRUD | Read | Create |
| Appointments | CRUD | Read | Create |
| AI Sessions | Read | Read | Create |
| Users | CRUD | — | — |
| Settings | CRUD | Read | Read (public only) |
| Analytics | Read | Read | — |
| Audit Logs | Read | — | — |
| Media | CRUD | CRUD | — |

### 4.3 Middleware Stack

```
Request → rateLimiter → cors → helmet → authMiddleware → adminMiddleware → controller
```

- `authMiddleware`: Validates JWT, attaches `req.user`
- `adminMiddleware`: Checks `req.user.role === 'admin'`
- `editorMiddleware`: Checks `req.user.role in ['admin', 'editor']`

---

## 5. Security Measures

### 5.1 Password Policy

- Minimum 8 characters
- Must include uppercase, lowercase, number
- Hashed with bcrypt (12 rounds)
- Never logged or returned in API responses

### 5.2 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| POST /auth/login | 5 attempts per 15 minutes per IP |
| POST /auth/refresh | 10 per hour per IP |
| POST /contact | 3 per hour per IP |
| POST /appointments | 3 per hour per IP |
| POST /ai/chat | 60 per hour per IP |
| All other endpoints | 100 per minute per IP |

### 5.3 Token Security

- Access tokens are short-lived (15 min)
- Refresh tokens are rotated on every use
- Revoked refresh tokens are stored in a blocklist
- JWT secret is stored in environment variables
- Separate secrets for access and refresh tokens

### 5.4 CORS Configuration

```typescript
{
  origin: [process.env.FRONTEND_URL],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}
```

---

## 6. Initial Admin Setup

On first deployment, the seed script creates:

```
Email: admin@denischamkaga.com (configurable via env)
Password: Set via ADMIN_INITIAL_PASSWORD env variable
Role: admin
```

Denis must change the password on first login.
