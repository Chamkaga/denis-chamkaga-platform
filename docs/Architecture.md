# System Architecture

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Architecture Overview

This platform follows a **Layered Architecture** pattern combined with **Feature-Based Organization** on the frontend and **Clean Architecture** on the backend. Every layer has a single responsibility and communicates only with adjacent layers through well-defined interfaces.

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                           │
│         React + TypeScript + Tailwind CSS + Framer Motion       │
│         Atomic Design · Feature-Based Pages · i18n              │
├─────────────────────────────────────────────────────────────────┤
│                    APPLICATION LAYER                            │
│       React Router · Zustand · TanStack Query · RHF + Zod      │
│       State Management · Routing · Data Fetching · Forms        │
├─────────────────────────────────────────────────────────────────┤
│                         API LAYER                               │
│              REST API · Express.js · JWT Auth                   │
│           Controllers · Middleware · Validators                 │
├─────────────────────────────────────────────────────────────────┤
│                     BUSINESS LOGIC LAYER                        │
│                  Services · Business Rules                      │
│           Lead Scoring · Booking · CRM · Analytics              │
├─────────────────────────────────────────────────────────────────┤
│                        AI LAYER                                 │
│         Conversation Engine · Intent Classification             │
│       Lead Qualification · Recommendation · Handoff             │
│          OpenAI · Future: OpenAI / Gemini / Claude              │
├─────────────────────────────────────────────────────────────────┤
│                    PERSISTENCE LAYER                            │
│              PostgreSQL · Prisma ORM · Migrations               │
│                Seeds · Audit Logs · Analytics                   │
├─────────────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE LAYER                          │
│         Docker · NGINX · GitHub Actions · Environment           │
│              Logging · Monitoring · Backups                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.x | UI framework |
| TypeScript | 6.x | Type safety |
| Vite | 8.x | Build tool and dev server |
| Tailwind CSS | 4.x | Utility-first CSS framework |
| Framer Motion | latest | Animations and transitions |
| React Router | 7.x | Client-side routing |
| TanStack Query | 5.x | Server state management |
| Zustand | 5.x | Client state management |
| React Hook Form | 7.x | Form handling |
| Zod | 3.x | Schema validation |
| react-i18next | latest | Internationalization (EN/SW) |
| react-helmet-async | latest | SEO meta management |

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 22.x LTS | Runtime |
| Express.js | 5.x | HTTP framework |
| TypeScript | 5.x | Type safety |
| Prisma | 6.x | ORM and migrations |
| PostgreSQL | 16.x | Primary database |
| JSON Web Token | 9.x | Authentication |
| bcrypt | 6.x | Password hashing |
| Zod | 3.x | Request validation |
| Winston | latest | Logging |
| Multer | latest | File uploads |
| Helmet | latest | Security headers |
| CORS | latest | Cross-origin |

### Infrastructure

| Technology | Purpose |
|------------|---------|
| Docker | Containerization |
| Docker Compose | Multi-service orchestration |
| NGINX | Reverse proxy and static serving |
| GitHub Actions | CI/CD pipeline |

### AI

| Technology | Purpose |
|------------|---------|
| OpenAI | OpenAI API |
| gpt-4o-mini 3.x | Primary local model |
| OpenAI-compatible API | Future cloud AI adapter |
| Custom Engine | Conversation, intent, lead scoring |

---

## 3. Architectural Principles

### 3.1 Separation of Concerns

Each layer handles one responsibility. The frontend never talks to the database directly. The backend never renders HTML. The AI layer is a modular service that the backend consumes.

### 3.2 Dependency Direction

Dependencies point inward. Infrastructure depends on business logic, never the reverse.

```
Infrastructure → Business Logic → Domain Models
      ↑                ↑
  Controllers       Services
      ↑                ↑
   Routes          AI Engines
```

### 3.3 Interface Segregation

Every module exposes a clean public API. Internal implementation details are never leaked across module boundaries.

### 3.4 Single Source of Truth

- **State**: Zustand stores for client state, TanStack Query for server state
- **Types**: Shared TypeScript interfaces in `/shared/types/`
- **Config**: Environment variables via `.env` files
- **Schema**: Prisma schema as the database source of truth

### 3.5 Fail Gracefully

Every layer implements error boundaries. The frontend shows user-friendly error states. The backend returns structured error responses. The AI falls back to safe defaults.

---

## 4. Communication Patterns

### Frontend ↔ Backend

- Protocol: HTTP/HTTPS
- Format: JSON
- Authentication: Bearer JWT tokens
- Error format: `{ success: boolean, data?: T, error?: { code: string, message: string } }`

### Backend ↔ Database

- Protocol: Prisma Client (connection pooling)
- Migrations: Prisma Migrate
- Seeding: Custom seed scripts

### Backend ↔ AI

- Protocol: Internal service calls (same process) for core AI
- Protocol: HTTP to OpenAI API for LLM inference
- Future: HTTP to OpenAI-compatible endpoints

---

## 5. Security Architecture

### Authentication Flow

```
Client → Login Request → Server validates credentials
                              ↓
                     Generate JWT (access + refresh)
                              ↓
                     Return tokens to client
                              ↓
Client stores tokens → Sends access token in Authorization header
                              ↓
                     Server validates JWT on protected routes
                              ↓
                     Refresh token rotation on expiry
```

### Authorization Layers

| Layer | Mechanism |
|-------|-----------|
| Route-level | Auth middleware checks JWT validity |
| Role-level | Admin middleware checks user role |
| Resource-level | Service layer checks ownership |

### Security Measures

- Password hashing with bcrypt (salt rounds: 12)
- JWT with short-lived access tokens (15 min)
- Refresh token rotation
- Helmet for security headers
- CORS with whitelist
- Rate limiting on auth endpoints
- Input validation on all endpoints
- SQL injection prevention via Prisma
- XSS prevention via React's default escaping
- CSRF protection
- Environment variable isolation
- Audit logging for admin actions

---

## 6. Scalability Considerations

### Current Architecture (Single Server)

```
[Client Browser] → [NGINX] → [Express API + React Static]
                                      ↓
                              [PostgreSQL]
                                      ↓
                              [OpenAI (Local)]
```

### Future Architecture (Scaled)

```
[CDN] → [Load Balancer] → [API Server 1..N]
                                  ↓
                          [PostgreSQL Primary]
                            ↓           ↓
                        [Read Replica] [Read Replica]
                                  ↓
                          [Redis Cache]
                                  ↓
                          [AI Service (Separate)]
```

The current architecture is designed so that scaling up requires zero refactoring of the application layer. The service layer is stateless. The database layer uses Prisma's connection pooling. The AI layer is behind an abstraction that can be pointed at any OpenAI-compatible API.

---

## 7. Module Dependency Map

```
Portfolio Module ──→ Projects, Gallery, Certificates, Career, Skills
Services Module ──→ Lead System, Booking, Contact
AI Module ──→ Conversation Engine, Intent, Scoring, Handoff
CRM Module ──→ Leads, Messages, Appointments, Analytics
Admin Module ──→ All modules (read/write access)
Auth Module ──→ Users, Roles, Permissions
Blog Module ──→ Posts, Categories, Tags
Investor Module ──→ Business Opportunities, Proposals
Settings Module ──→ Theme, Language, Site Config
```

---

## 8. Data Flow

### Visitor Journey

```
1. Visitor lands on homepage
2. Browses portfolio (projects, gallery, certificates)
3. Explores services
4. Engages AI Assistant
5. AI qualifies lead (cold/warm/hot)
6. AI collects contact information
7. AI recommends services or books appointment
8. If high-value: handoff to Denis via WhatsApp/email
9. Lead stored in CRM
10. Denis manages via Admin Dashboard
```

### Admin Journey

```
1. Denis logs in via /admin
2. Dashboard shows analytics, leads, messages
3. Manages portfolio content (projects, gallery, blog)
4. Reviews AI conversations
5. Manages appointments and leads
6. Updates site settings and theme
7. All actions logged in audit trail

---

## 9. Additional Architecture Specifications

*   [Support Contribution Architecture](file:///d:/Projects/denis-chamkaga-platform/docs/architecture/SupportContributionArchitecture.md) - Production Design Specification for the "Support the Vision" ecosystem funnel integration.
*   [Direct Pay Online (DPO) Integration](file:///d:/Projects/denis-chamkaga-platform/docs/integrations/DPOIntegration.md) - Implementation specifications for the hosted payment gateway service.
*   [Gate 0 Approval Constitution](file:///d:/Projects/denis-chamkaga-platform/docs/Gate0Approval.md) - Formal constitutional approval sign-off for the Enterprise Baseline.
```
