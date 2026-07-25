# Denis Business Platform — Documentation Index & Enterprise Master Gateway

```
Version: 1.0.0
Last Updated: 2026-07-25
Author: Chief Systems Architect
Reviewed By: Denis Chamkaga Lead Engineering Directorate
Approval Status: APPROVED (Official Enterprise Standard)
Related Documents: All files inside /docs
```

---

## 1. Documentation Vision & Source Code Policy

> [!IMPORTANT]
> **The `/docs` directory is part of the source code.**
>
> Any modification to UI, UX, business logic, AI, CRM, Admin Console, Database, API, or Design System **must** be accompanied by updates to the relevant documentation before a Pull Request can be approved.
>
> Documentation is treated as production code and follows the same review and versioning process.

---

## 2. Enterprise Documentation Hierarchy Tree

```
README.md (Master Index & Entrance Gateway)
│
├── PRODUCT_SPECIFICATION.md           (Product PRD: Vision, Personas, Modules, Roadmap, KPIs)
│
├── DESIGN_SYSTEM.md                   (The UI Bible: Colors, Typography, Glassmorphism, Tokens)
│
├── INFORMATION_ARCHITECTURE.md        (Site Map, Page Hierarchy, Navigation & URLs)
│
├── COMPONENT_LIBRARY.md               (Atomic & Organism UI Component Specifications)
│
├── UI_FLOW.md                         (Screen Wireflows, State Transitions & Entry/Exit Points)
│
├── CHAT_WIDGET_ARCHITECTURE.md        (Floating Chat Widget, Mary Onboarding & UX Rules)
│
├── DENIS_ASSISTANT_ARCHITECTURE.md     (AI Ecosystem, Mary Persona, RAG & WebRTC Calls)
│
├── CRM_ARCHITECTURE.md                (Business Engine: Leads, Pipeline, Quotes, Invoices)
│
├── ADMIN_ARCHITECTURE.md              (Admin Console, CMS, RBAC, System Audits & Ops)
│
├── DATABASE_SCHEMA.md                 (Prisma Models, Indexes, Constraints & ER Diagram)
│
├── API_REFERENCE.md                   (Complete REST Endpoints, Payloads & Error Handling)
│
├── SYSTEM_ARCHITECTURE.md             (End-to-End System Blueprint & Data Pipelines)
│
├── KNOWLEDGE_GOVERNANCE.md            (Phase 5 Step 5 Governance, Versioning & Approvals)
│
├── BUSINESS_RULES.md                  (Comprehensive Business Logic, Lead Scoring & Limits)
│
├── SECURITY_ARCHITECTURE.md           (Auth, RBAC, Encryption, CSP, OWASP Guardrails)
│
├── DEPLOYMENT_ARCHITECTURE.md         (Docker, VPS, Nginx Proxy, SSL, PostgreSQL, Redis)
│
├── TESTING_STRATEGY.md                (Unit, Integration, E2E, Regression & Smoke Tests)
│
├── OPERATIONS_MANUAL.md               (System Administration, CMS/CRM Management & User Guide)
│
├── CONTRIBUTING.md                    (Developer Setup, Branching, Commit Standards & PR Checklist)
│
└── DECISION_LOG.md                    (Architectural Decision Records - 12 ADRs)
```

---

## 3. Recommended Reading Order for New Developers

To quickly onboard and contribute safely without breaking established contracts:

1. **Step 1: Product & System Vision** — Read [PRODUCT_SPECIFICATION.md](file:///d:/Projects/denis-chamkaga-platform/docs/PRODUCT_SPECIFICATION.md) and [SYSTEM_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/SYSTEM_ARCHITECTURE.md).
2. **Step 2: UI & Navigation Standards** — Study [DESIGN_SYSTEM.md](file:///d:/Projects/denis-chamkaga-platform/docs/DESIGN_SYSTEM.md), [INFORMATION_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/INFORMATION_ARCHITECTURE.md), [COMPONENT_LIBRARY.md](file:///d:/Projects/denis-chamkaga-platform/docs/COMPONENT_LIBRARY.md), and [UI_FLOW.md](file:///d:/Projects/denis-chamkaga-platform/docs/UI_FLOW.md).
3. **Step 3: AI Assistant & Widget** — Inspect [CHAT_WIDGET_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/CHAT_WIDGET_ARCHITECTURE.md) and [DENIS_ASSISTANT_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/DENIS_ASSISTANT_ARCHITECTURE.md).
4. **Step 4: Business Rules & CRM** — Review [CRM_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/CRM_ARCHITECTURE.md), [BUSINESS_RULES.md](file:///d:/Projects/denis-chamkaga-platform/docs/BUSINESS_RULES.md), and [KNOWLEDGE_GOVERNANCE.md](file:///d:/Projects/denis-chamkaga-platform/docs/KNOWLEDGE_GOVERNANCE.md).
5. **Step 5: API, Database & Security** — Inspect [ADMIN_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/ADMIN_ARCHITECTURE.md), [API_REFERENCE.md](file:///d:/Projects/denis-chamkaga-platform/docs/API_REFERENCE.md), [DATABASE_SCHEMA.md](file:///d:/Projects/denis-chamkaga-platform/docs/DATABASE_SCHEMA.md), and [SECURITY_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/SECURITY_ARCHITECTURE.md).
6. **Step 6: DevOps, Testing & ADRs** — Read [DEPLOYMENT_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/DEPLOYMENT_ARCHITECTURE.md), [TESTING_STRATEGY.md](file:///d:/Projects/denis-chamkaga-platform/docs/TESTING_STRATEGY.md), [OPERATIONS_MANUAL.md](file:///d:/Projects/denis-chamkaga-platform/docs/OPERATIONS_MANUAL.md), [CONTRIBUTING.md](file:///d:/Projects/denis-chamkaga-platform/docs/CONTRIBUTING.md), and [DECISION_LOG.md](file:///d:/Projects/denis-chamkaga-platform/docs/DECISION_LOG.md).

---

## 4. Preservation Guarantee

The following core modules are approved in production and **MUST NOT** be altered or redesigned without explicit sign-off:
- Floating Chat Widget & Progressive 3-Step Onboarding
- Denis Assistant (Mary Persona)
- How Consultation Works & Business Solutions
- Public Landing Pages & Portfolio Showcase
- Admin Console, CRM, Finance OS
- Core API Contracts & Database Schema

All documentation updates must reflect the active implementation without altering verified contracts.
