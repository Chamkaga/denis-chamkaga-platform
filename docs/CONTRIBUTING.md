# Denis Business Platform — Developer Contribution & Quality Guidelines

```
Version: 1.0.0
Last Updated: 2026-07-25
Author: Lead Frontend & Core Systems Architect
Reviewed By: Denis Chamkaga Engineering Team
Approval Status: APPROVED (Official Project Standard)
Related Documents: [README.md](file:///d:/Projects/denis-chamkaga-platform/docs/README.md), [TESTING_STRATEGY.md](file:///d:/Projects/denis-chamkaga-platform/docs/TESTING_STRATEGY.md), [DESIGN_SYSTEM.md](file:///d:/Projects/denis-chamkaga-platform/docs/DESIGN_SYSTEM.md)
```

---

## 1. Non-Negotiable Documentation Policy

> [!IMPORTANT]
> **The `/docs` directory is part of the source code.**
>
> Any modification to UI, UX, business logic, AI, CRM, Admin Console, Database, API, or Design System **must** be accompanied by updates to the relevant documentation inside `/docs` before a Pull Request can be approved.
>
> Documentation is treated as production code and follows the same review and versioning process.

---

## 2. Local Development Setup

```bash
# 1. Clone repository
git clone https://github.com/chamkaga/denis-chamkaga-platform.git
cd denis-chamkaga-platform

# 2. Install dependencies
npm install

# 3. Spin up PostgreSQL database container
docker-compose up -d postgres

# 4. Run Prisma database migrations
cd backend && npx prisma migrate dev

# 5. Start development servers
npm run dev
```

---

## 3. Git Branching & Commit Conventions

### 3.1 Branch Naming Format
- `feature/short-description` (e.g., `feature/crm-quote-pdf`)
- `fix/short-description` (e.g., `fix/onboarding-phone-validation`)
- `docs/short-description` (e.g., `docs/update-api-reference`)

### 3.2 Commit Message Format (Conventional Commits)
- `feat(crm): add PDF quotation generation`
- `fix(widget): prevent non-numeric input in phone field`
- `docs(ai): update knowledge governance approval policy`

---

## 4. Pull Request (PR) Checklist

Before submitting a Pull Request:
- [ ] TypeScript compilation passes cleanly (`npm run type-check`).
- [ ] ESLint passes without errors (`npm run lint`).
- [ ] Production bundle builds successfully (`npm run build`).
- [ ] **Documentation updated** in `/docs` for any touched module.
