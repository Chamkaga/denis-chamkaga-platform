# Testing Strategy

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Testing Philosophy

Every module must include tests. Code without tests is considered incomplete. Tests are written alongside implementation, not after.

---

## 2. Testing Stack

| Tool | Purpose | Context |
|------|---------|---------|
| Vitest | Unit & integration tests | Frontend |
| @testing-library/react | Component testing | Frontend |
| @testing-library/jest-dom | DOM assertions | Frontend |
| Jest | Unit & integration tests | Backend |
| Supertest | API endpoint testing | Backend |
| Prisma (test client) | Database testing | Backend |

---

## 3. Test Types

### 3.1 Unit Tests

**Scope:** Individual functions, utilities, hooks, services.

**Frontend Examples:**
- `formatDate()` returns correct locale strings
- `calculateLeadScore()` returns expected scores
- `useDebounce()` delays value changes correctly
- Zod schemas validate and reject correctly

**Backend Examples:**
- `slugify()` generates URL-safe slugs
- `hashPassword()` returns valid bcrypt hash
- JWT `generateToken()` creates valid tokens
- Lead scoring logic produces correct scores

### 3.2 Component Tests

**Scope:** React components render correctly and respond to interactions.

**Examples:**
- `Button` renders with correct variant classes
- `Button` fires onClick handler
- `Input` shows error message when error prop provided
- `ProjectCard` renders title, image, and tech stack
- `Navbar` shows mobile menu on hamburger click
- `ThemeToggle` switches between dark and light icons
- `ContactForm` validates required fields before submission

### 3.3 Integration Tests

**Scope:** Multiple units working together correctly.

**Frontend Examples:**
- Form submission → API call → success state
- Login flow → token storage → authenticated state
- Language switch → all visible text changes

**Backend Examples:**
- Auth flow: register → login → access protected route
- CRUD flow: create project → read → update → soft delete
- Lead capture: AI chat → lead created → notification sent

### 3.4 API Tests

**Scope:** HTTP endpoints return correct responses.

**Examples:**
```
GET  /api/v1/projects          → 200 with array of projects
GET  /api/v1/projects/:slug    → 200 with single project
GET  /api/v1/projects/:slug    → 404 when slug doesn't exist
POST /api/v1/projects          → 401 without auth token
POST /api/v1/projects          → 201 with valid auth and data
POST /api/v1/projects          → 400 with invalid data (validation)
POST /api/v1/auth/login        → 200 with valid credentials
POST /api/v1/auth/login        → 401 with wrong password
POST /api/v1/auth/login        → 429 after 5 failed attempts
POST /api/v1/contact           → 201 with valid form data
POST /api/v1/contact           → 400 with missing required fields
POST /api/v1/ai/chat           → 200 with AI response
```

### 3.5 End-to-End Readiness

E2E tests are planned for post-launch (Playwright or Cypress). The architecture is built to support E2E testing:

- All interactive elements have unique `data-testid` attributes
- API responses follow consistent structure
- Routes are deterministic

---

## 4. Test File Organization

```
# Frontend
src/components/atoms/Button/
├── Button.tsx
├── Button.test.tsx      ← Tests live next to source
└── index.ts

# Backend
src/services/
├── project.service.ts
└── project.service.test.ts

src/controllers/
├── project.controller.ts
└── project.controller.test.ts
```

---

## 5. Coverage Targets

| Category | Target | Minimum |
|----------|--------|---------|
| Backend Services | 80% | 70% |
| Backend Controllers | 70% | 60% |
| Backend Validators | 90% | 80% |
| Frontend Utilities | 90% | 80% |
| Frontend Components | 70% | 60% |
| Frontend Hooks | 80% | 70% |
| AI Modules | 75% | 65% |
| **Overall** | **75%** | **65%** |

---

## 6. Testing Commands

```bash
# Frontend
cd frontend
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage report

# Backend
cd backend
npm test              # Run all tests
npm test -- --watch   # Watch mode
npm test -- --coverage # Coverage report

# Root (both)
npm test              # Runs tests in both workspaces
```

---

## 7. CI Testing

Tests run automatically on every push via GitHub Actions:

1. Install dependencies
2. Run linter
3. Run type checking
4. Run unit tests
5. Run integration tests
6. Generate coverage report
7. Fail pipeline if coverage below minimum

---

## 8. Test Data

- **Frontend**: Mock data objects in `__mocks__/` directories
- **Backend**: Test database with Prisma, seeded before test suite
- **API Tests**: Factory functions to generate test data
- **No production data in tests**: All test data is synthetic
