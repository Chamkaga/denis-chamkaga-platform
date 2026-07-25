# Denis Business Platform — Architectural Decision Records (ADR Log)

```
Version: 1.0.0
Last Updated: 2026-07-25
Author: Chief Software Architect
Reviewed By: Denis Chamkaga Steering Committee
Approval Status: APPROVED (Official Project Standard)
Related Documents: [SYSTEM_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/SYSTEM_ARCHITECTURE.md), [README.md](file:///d:/Projects/denis-chamkaga-platform/docs/README.md)
```

---

## 1. Overview & ADR Index

This document records the key architectural decision records (ADRs) explaining *why* technical, visual, operational, and AI choices were made for the Denis Business Platform.

---

## 2. ADR Log Matrix

| ADR ID | Decision Title | Status | Primary Rationale |
| :--- | :--- | :--- | :--- |
| **ADR-001** | React 18 + Vite + TypeScript Frontend | APPROVED | Maximum render performance, instant HMR, strong type safety. |
| **ADR-002** | Vanilla CSS + Design Tokens (No Tailwind) | APPROVED | Total control over bespoke glassmorphic UI, avoiding utility bloat. |
| **ADR-003** | Floating Chat Widget as Sole Interface | APPROVED | Prevents data fragmentation & delivers uniform lead capture across site. |
| **ADR-004** | Progressive 3-Step Onboarding Flow | APPROVED | Reduces form friction; increases visitor lead completion by >40%. |
| **ADR-005** | Mary Persona as First Contact | APPROVED | 24/7 instant response, bilingual support, automated qualification. |
| **ADR-006** | Direct Handover & WebRTC to Denis | APPROVED | Connects high-value leads directly with the principal decision maker. |
| **ADR-007** | PostgreSQL + Prisma ORM Data Stack | APPROVED | ACID compliance, strong relational schema, automated migrations. |
| **ADR-008** | Retrieval-Augmented Generation (RAG) | APPROVED | Eliminates LLM hallucinations by grounding responses in DB records. |
| **ADR-009** | Server-Sent Events (SSE) Streaming | APPROVED | Low-latency token streaming without complex WebSocket overhead. |
| **ADR-010** | Docker Compose Production Topology | APPROVED | Reproducible, isolated environment orchestration across deployments. |
| **ADR-011** | Tokenized Public Document Portal | APPROVED | Secure client access to quotes/invoices without requiring account creation. |
| **ADR-012** | Mandatory `/docs` Documentation Policy | APPROVED | Guarantees long-term codebase maintainability & architectural integrity. |

---

## 3. Detailed Decision Records

### ADR-003: Floating Chat Widget as Sole Customer Interface
- **Context:** Previous design proposals considered adding separate contact forms on individual service pages.
- **Decision:** Restrict all conversational interaction to the global Floating Chat Widget.
- **Consequences:** Eliminates duplicate onboarding, preserves single session state (`assistantSessionId`), and ensures all leads enter the unified CRM pipeline.

### ADR-008: Retrieval-Augmented Generation (RAG) Architecture
- **Context:** Direct LLM prompts resulted in generic responses and potential hallucinations regarding pricing or project availability.
- **Decision:** Implement dynamic database RAG loading via `knowledge-loader.ts`.
- **Consequences:** AI answers strictly from verified biography, services, and portfolio records. Unverified topics trigger safe redirection.
