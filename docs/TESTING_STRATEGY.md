# Denis Business Platform — Testing Strategy & Quality Assurance Specification

```
Version: 1.0.0
Last Updated: 2026-07-25
Author: Lead QA Automation Engineer
Reviewed By: Denis Chamkaga Quality Engineering Team
Approval Status: APPROVED (Official Project Standard)
Related Documents: [SYSTEM_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/SYSTEM_ARCHITECTURE.md), [CONTRIBUTING.md](file:///d:/Projects/denis-chamkaga-platform/docs/CONTRIBUTING.md)
```

---

## 1. Overview & Testing Philosophy

The **Testing Strategy** defines the quality assurance standards, automated test suites, verification scripts, and regression protocols required to guarantee zero-defect releases for the Denis Business Platform.

---

## 2. Testing Pyramid & Suite Breakdown

```
       / \
      /   \     E2E Tests (Playwright / Cypress) - UI & User Flows
     /-----\
    /       \   Integration Tests (Jest / Supertest) - API & Database
   /---------\
  /           \ Unit & Validation Tests (Vitest / Verification Scripts)
 /-------------\
```

### 2.1 Unit & Validation Tests
- **Scope:** Validation helpers (`validateFullName`, `validateEmail`, `validatePhone`), prompt builders, lead scoring algorithms.
- **Verification Scripts:** Custom TypeScript runner scripts in `backend/src/scripts/`:
  - `npx ts-node backend/src/scripts/verify-sprint2.ts`
  - `npx ts-node backend/src/scripts/verify-ai-http-live.ts`

### 2.2 Integration Tests
- **Scope:** API routes, JWT token refresh interceptors, Prisma database transactions, SSE chat stream buffers.

### 2.3 End-to-End (E2E) Tests
- **Scope:** Complete visitor journeys: Onboarding flow on Chat Widget, Public Quotation viewing, Admin Login, CMS publishing.

---

## 3. Pre-Commit & Continuous Integration (CI) Checks

Before any code is merged into `main`:
1. **Type Check:** `npm run type-check` (Zero TypeScript compilation errors).
2. **Linting:** `npm run lint` (ESLint compliance).
3. **Build Validation:** `npm run build` (Clean production bundle build).
4. **Documentation Verification:** Verification that modified modules include updated `/docs` specifications.
