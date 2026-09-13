# Denis Chamkaga Business Platform — Full System Audit

**Audit date:** 10 September 2026  
**Target:** current `main` working tree, including pre-existing uncommitted changes  
**Verdict:** **NO-GO** for production deployment

## Executive assessment

The repository implements a broad business platform around Denis Chamkaga's public brand and consulting work. It combines a public portfolio and lead-generation site, Mary (a bilingual business assistant), a CRM, content and knowledge management, finance and payments, project workspaces, supporter and collaborator management, marketing, media, analytics, and an owner-oriented admin console.

The application compiles and its schema/migrations are internally consistent: TypeScript typecheck passed, the production build passed, Prisma validation passed, and both migrations together create all 87 current models. The public pages also rendered on desktop and a 390×844 mobile viewport without horizontal overflow.

It is not ready for production. Public Mary endpoints allow unauthenticated access and mutation by raw session/visitor ID, including history download and deletion, plus unauthenticated WebRTC signaling and call-log mutation. The configured AI provider has no credits; every live generation request returned HTTP 429 while the test suite still reported 23/23 success using fallbacks. Public blog HTML is inserted without an evident sanitizer. Admin access is coarse role checking rather than resource-level RBAC. The CI deployment workflow builds but does not run the complete quality or security gate. These are release-blocking issues.

No application code was changed during this audit. This report is the only new file.

## 1. System understanding and business purpose

The platform serves five actors:

| Actor | Implemented role | Boundary |
|---|---|---|
| Visitor | Browse portfolio, services, projects, blog, support, diagnostics and contact pages; converse with Mary | Should access only public content and their own conversation |
| Prospect/customer | Submit enquiries, receive quotations/invoices, approve or request revisions, pay, and progress into a project | Public document token is the capability boundary; customer portal coverage is partial |
| Mary | Educate, diagnose business pain, retrieve approved knowledge, qualify leads, guide pricing/payment/delivery, and recommend handoff | Must never access admin-only data or treat a caller-supplied role/session ID as authority |
| Administrator | Operate content, CRM, knowledge, media, finance, projects, supporters, marketing, reports and settings | Server currently admits both `admin` and `super_admin` to almost every admin route |
| Owner/Denis | Brand subject and business owner; owner dashboard, financial analytics, presence/calls and system settings | Implemented as `super_admin` plus owner-oriented UI; there is no separate owner tenant boundary |

Denis is represented as the platform owner, consultant and service provider. Public facts come from site content, settings, services, FAQs and Mary knowledge. The admin console exposes business operations and an owner dashboard, but the data model is essentially single-tenant: `TenantConfig` exists while most records are not keyed by tenant. Growth into multiple organizations or delegated administrators would require explicit tenancy and row-level ownership rules.

## 2. Actual architecture

```text
Browser (React 19 + Vite + React Router + React Query + Zustand)
  ├─ Public pages and ChatWidget
  └─ Admin console (lazy route chunks)
          │ HTTP/JSON and SSE
          ▼
Express 5 API
  ├─ global Helmet, CORS, rate limiting, logging and telemetry
  ├─ public/content/auth/document/payment routes
  ├─ admin routes with JWT + admin/super_admin role checks
  ├─ domain services: CRM, finance, projects, content, DAM, marketing
  └─ Mary orchestration and event/workflow services
          │
          ├─ Prisma 6 → PostgreSQL (87 models)
          ├─ optional Redis event/broker infrastructure
          ├─ local/cloud storage adapters
          ├─ OpenAI provider
          └─ DPO/Flutterwave, email and notification adapters
```

Deployment assets include separate frontend/backend Dockerfiles, Docker Compose, Nginx, PM2 configuration, backup/restore scripts and GitHub Actions. The backend advertises OpenTelemetry and Prometheus metrics, but the middleware order means several primary route groups are registered before `observabilityMiddleware`, so those calls do not receive that instrumentation.

## 3. Implemented end-to-end flow

```text
Visitor → public site / Mary / contact or diagnostic flow
        → Lead and ChatSession records
        → admin CRM qualification
        → quotation with tokenized public review
        → acceptance can create project + invoice
        → public invoice checkout / payment verification
        → project workspace, milestones, tasks and assets
        → delivery, training and support described in knowledge/content
```

The public browsing, Mary conversation, lead storage, quotation/invoice/payment and internal project entities are implemented. A complete authenticated customer portal, enforceable delivery SLA, training workflow and support-ticket lifecycle are not complete end-user products; several are represented by documents, knowledge entries or internal records rather than a customer-facing workflow.

## 4. Mary architecture and behavior

The requested conceptual diagram is close, with important corrections:

```text
ChatWidget → POST /api/ai/chat/stream → conversationService
 → aiOrchestrator
 → session lookup/create + input guards
 → last 10 conversation rows + session metadata
 → context manager
    ├─ keyword intent classifier
    ├─ knowledge engine (database + static providers, BM25-style scoring)
    ├─ facts/memory
    └─ lead intelligence
 → prompt builder → OpenAI provider → SSE callback
 → response validator → transactional conversation persistence
 → asynchronous fact extractor + event bus + channel recommendation
```

Mary should explain services and business concepts, diagnose needs, qualify a lead, ground prices/payment/contact claims in approved knowledge, explain delivery/training/support, remember relevant context, and offer a human handoff. She should refuse unrelated requests and prompt injection; avoid internal/admin knowledge, invented facts/prices/payment methods and binding commitments; and identify herself as Denis's assistant rather than Denis.

The implementation has input guards, audience-aware knowledge providers, response validation, static/database precedence, bilingual support and fallback responses. However, the public request schema does not accept a role while the orchestrator supports `userRole`; authorization is not the same thing as prompt filtering. Conversation ownership is absent at the API boundary.

## 5. Mary quality and measured performance

The live conversational script ran six scenarios and 23 turns. Its process exited 0 and printed 23/23 passed, but **every OpenAI generation request failed with HTTP 429 due to zero credits**. Assertions therefore evaluated fallback text and cannot certify model accuracy, grounding or hallucination behavior.

Representative observed timings from the runtime logs:

| Query | Classified intent | Retrieval | Reported TTFT | Total | Audit result |
|---|---|---:|---:|---:|---|
| I own a small shop | Service Inquiry | 610 ms | 7,457 ms | 8,405 ms | FAIL: provider 429; fallback |
| My business is losing money | Service Inquiry | 45 ms | 4,383 ms | 6,192 ms | FAIL: provider 429; fallback |
| What is a POS? | Service Inquiry + Learning | 38 ms | 2,187 ms | 3,173 ms | FAIL: provider 429; fallback |
| Would I need one? | General Inquiry | 57 ms | 2,179 ms | 3,207 ms | FAIL: weak intent; fallback |
| I sell through WhatsApp | Service Inquiry | 33 ms | 2,511 ms | 3,360 ms | FAIL: provider 429; fallback |
| How do I pay? | Payment Inquiry | 42 ms | 3,529 ms | 4,258 ms | FAIL: provider 429; fallback |
| What happens after payment? | General Inquiry | 36 ms | 2,367 ms | 4,190 ms | FAIL: intent miss; fallback |
| Do you provide training? | Capability + Service | 71 ms | 2,171 ms | 2,983 ms | FAIL: provider 429; fallback |

Across the eight representative rows: total minimum 2,983 ms, maximum 8,405 ms, average about 4,471 ms, and nearest-rank p95 8,405 ms. These TTFT values are failure/fallback timings, not valid first-token latency from a successful LLM response.

Quality defects observed during the run:

- Background fact extraction raced with test cleanup and repeatedly raised Prisma P2025 while updating deleted sessions.
- Facts drifted to unrelated industries (`restaurant` during a beginner POS conversation and `pharmacy` during Denis-profile context).
- Short follow-ups such as “Would I need one?” and “What happens after payment?” classified as `General Inquiry`, even though history clearly establishes learning/payment context.
- “How much?” retrieved zero documents in one contextual turn. Pricing safety then depends on prompt history and fallback code rather than positive grounded retrieval.
- The extractor makes a second provider call after generation. With provider failure this adds seconds, duplicates errors and can preserve the previous response as if it were fresh extraction output.

## 6. Website and frontend performance

The production build completed in about 1.14 seconds after TypeScript compilation. Major emitted assets were:

| Asset | Raw | Gzip | Assessment |
|---|---:|---:|---|
| generic vendor chunk | 517 kB | 164 kB | High initial/cache cost |
| main application JS | 318 kB | 80 kB | High for public entry |
| React vendor | 290 kB | 95 kB | Expected but material |
| CSS | 172 kB | 24 kB | Reasonable compressed; large raw |
| `NewAdminPages` | 118 kB | 19 kB | Multiple modules bundled together |

Public image assets include many 700–928 kB files, including duplicate PNG/WebP variants. The largest observed file was `future/terrasafi_lab.webp` at 928 kB. Eager imports load six public pages into the entry graph, and idle preloading fetches four secondary chunks on every visit. This improves later navigation at the cost of first-load CPU/network, especially on mobile.

Browser QA measured warm local navigation wall time after waiting for idle/settle. Desktop representative pages ranged 0.73–1.52 seconds; mobile 390×844 ranged 0.99–3.50 seconds. The mobile home page was the slowest observed at 3.50 seconds. No tested mobile page had horizontal overflow. These are comparative local measurements, not production Lighthouse/Core Web Vitals, because no deployed URL or throttled production environment was available.

UX findings include an accidental `/admin/calendar font` route, a brief admin-shell flash before unauthenticated redirect, inconsistent page titles on blog/support, placeholder contact display alongside a real WhatsApp URL, and a large lint backlog affecting effects, purity and hook dependencies. Accessibility basics are present on major controls, but a formal keyboard, contrast and screen-reader pass remains required.

## 7. Backend, database and scaling analysis

The schema has 87 models, 141 migration indexes and matching table coverage. Strengths include unique constraints, many foreign keys, audit/history entities, soft deletion on core content, decimal money fields in primary finance models and indexes on common statuses/foreign keys.

Risks:

- Single-tenant assumptions are embedded across business records. `organizationId` is a business relationship, not an authorization tenant key.
- Several financial/support models use `Float` while core accounting uses `Decimal`; conversions can cause rounding discrepancies.
- Status, permission resource/action, provider and workflow fields are often free-form strings, weakening referential and state-machine integrity.
- Mary loads history ascending with `take: 10`; this selects the oldest ten rows rather than the newest ten for long sessions, causing context loss.
- A Mary request performs session lookup/create, history, optional metadata update, context retrieval, transactional writes, settings retrieval and a final conversation count, plus asynchronous extraction. The count and settings queries can be eliminated or cached; background extraction needs durable jobs/cancellation semantics.
- WebRTC signaling is in process memory and supports one global active call, so it fails under multi-instance deployment and restart.
- The workflow/event bus is largely local process state; durable outbox components exist but are not consistently the execution boundary.
- Public APIs accept up to 10 MB JSON globally. Large limits increase parsing and denial-of-service exposure where most endpoints need kilobytes.

## 8. Admin console audit

| Module | Frontend | Backend/API | Main entities | Assessment |
|---|---|---|---|---|
| Dashboard/owner | `/admin`, dashboard views | `/api/admin/dashboard`, business/finance analytics | users, leads, projects, payments, activities | Implemented; owner is super-admin convention |
| Content/portfolio | `/admin/content` | admin CRUD routes | projects, services, posts, gallery, experience, education, certificates | Broad CRUD; mostly coarse role control |
| CRM | `/admin/crm` | admin/business routes | leads, contacts, organizations, consultations | Implemented; customer isolation not modeled |
| Finance | `/admin/finance` | `/api/admin/finance` + public docs | quotations, invoices, payments, receipts, journal entries | Rich model; payment verification and audit need hardening |
| Knowledge | `/admin/knowledge` | `/api[/v1]/knowledge` | knowledge items, versions, jobs, audit logs | Permission middleware on mutations; public reads/test endpoints need review |
| Media/DAM | `/admin/media` | `/api/admin` DAM/upload | digital assets | Authenticated admin upload; file signature scanning absent |
| Projects | `/admin/projects` | workspace routes | projects, milestones, tasks, files | Implemented internal workspace; client portal incomplete |
| Supporters | `/admin/supporters` | supporters routes | profiles, contributions, collaborators | Implemented; uses Float for money |
| Marketing | `/admin/marketing` | marketing routes | campaigns, journeys, consent | Models/workflows present; delivery-provider completeness varies |
| Operations/reports/settings | corresponding routes | operations/admin/telemetry | logs, flags, settings, audit | Useful surfaces; observability coverage/order incomplete |

Backend protection is consistent at the route-group level for admin, finance, business, DAM, upload, projects, supporters, marketing and operations. Except for super-admin user management and knowledge permissions, most administrators receive full read/write access. The navigation's optional permission fields are mostly absent, so it does not accurately express authorization.

## 9. Security review

Positive controls include bcrypt password hashing, signed access/refresh JWTs, refresh-token hashing and rotation, login throttling, global and chat rate limits, Helmet, CORS allowlisting, Prisma parameterization, upload size/type filters, dangerous/double-extension checks, document token hashing, webhook signature support and financial/audit logs.

Security gaps:

- **Broken object-level authorization:** all Mary session history, visitor-session list, download, rename, close and delete routes are public. No ownership token is checked.
- **Unauthenticated call control:** WebRTC offers, answers, candidates and call logs are public and keyed only by session ID. `denisNotes` can be written through the public call-log endpoint.
- **Stored XSS risk:** blog content is rendered with `dangerouslySetInnerHTML`; no sanitizer is evident in the rendering path. CSP also permits `unsafe-inline` scripts.
- **Bearer tokens in Web Storage:** access and refresh tokens are available to injected JavaScript, increasing the impact of any XSS. Two parallel auth-store implementations increase inconsistency risk.
- **Admin RBAC is coarse:** most business-sensitive writes use `admin|super_admin`, not per-resource permission checks.
- **Upload trust is extension/MIME based:** MIME is client-controlled, SVG/Office/archive formats can contain active content, and no magic-byte validation, malware scan or quarantine pipeline is present. Uploaded files are served from a public static route.
- **Webhook fail-open configuration:** signature validation occurs only when `FLW_WEBHOOK_SECRET` is configured. Production startup should reject an enabled payment gateway without this secret.
- **SSRF helper is incomplete:** it does not resolve DNS and re-check resulting IPs, allowing rebinding/internal resolution if used for server-side fetches.
- **Sensitive payment payload retention:** full gateway payload/raw response JSON is persisted without field allowlisting or retention policy.

## 10. Errors, tooling and test credibility

| Gate | Result | Interpretation |
|---|---|---|
| `npm run typecheck` | PASS | Backend and frontend compile without type errors |
| `npm run lint` | PASS exit code, 473 warnings | Not a clean quality gate; warnings include hook dependencies, effect-set-state, render impurity and widespread `any` |
| `npm run build` | PASS | Shared, backend and frontend production builds succeed |
| Prisma validate | PASS | Schema syntax and relations validate |
| Mary conversational suite | Misleading PASS | 23/23 assertions passed while every LLM generation returned 429 |
| Real browser QA | Partial PASS | Representative public/mobile/login surfaces render; admin authenticated walkthrough unavailable without using account credentials |

VS Code/editor-only warnings were not available from the Problems panel. The 473 ESLint findings are project warnings, not editor-extension noise. The Prisma P2025 errors and provider 429s are real runtime defects/configuration failures.

## 11. Prioritized findings

| ID | Area | Finding | Severity | Evidence | Root cause | Recommendation |
|---|---|---|---|---|---|---|
| SEC-01 | Mary privacy | Conversation read/download/rename/close/delete lacks ownership/auth | P0 | `ai.routes.ts` public routes 55–61 | Session ID treated as authorization | Issue signed opaque visitor/session capability; enforce ownership on every operation; admin access separately authenticated |
| SEC-02 | Voice/calls | WebRTC signaling and call-log mutation are unauthenticated | P0 | `ai.routes.ts` 46–54 | Public signaling API has no participant capability or admin boundary | Authenticate admin operations; bind visitor operations to signed session capability; validate state transitions |
| SEC-03 | Content | Stored HTML rendered without evident sanitization | P0 | `BlogDetailPage.tsx` 386 | CMS content trusted at render | Sanitize on write and render with a strict allowlist; remove inline-script CSP exception using nonces/hashes |
| AI-01 | Availability | AI provider has no credits; fallback masks outage | P1 | Live OpenAI 429 on every turn | Provider/billing readiness absent | Add startup/health readiness, alerting, circuit breaker and an honest degraded-state UI |
| QA-01 | Tests | Mary suite reports success when provider calls fail | P1 | 23/23 pass despite 429 | Assertions accept fallback without provider-success invariant | Split offline fallback tests from live certification; fail live gate on provider failure and record model/usage |
| AI-02 | Memory | Background extraction races deletion and corrupts facts | P1 | repeated Prisma P2025; wrong industries | Fire-and-forget job lacks lifecycle/version control | Durable job/outbox, session existence/version checks, idempotency and cancellation |
| AI-03 | Context | Long chats load oldest ten messages | P1 | ascending order + `take: 10` | Pagination direction error | Fetch newest ten descending, reverse before prompt; summarize older context |
| SEC-04 | Auth | Tokens stored in local/session storage | P1 | auth stores and API interceptor | SPA bearer-token design | Move refresh token to Secure HttpOnly SameSite cookie; keep short-lived access token in memory |
| SEC-05 | Uploads | Public/admin uploads rely on name and MIME and are publicly served | P1 | upload middleware + `/uploads` static | No content inspection/quarantine | Magic-byte checks, malware scanning, SVG sanitization, private storage and signed download URLs |
| OPS-01 | CI/CD | Deployment workflow builds but does not test/lint/migrate | P1 | `.github/workflows/deploy.yml` | Certification and deployment gates split | Require typecheck, lint threshold, tests, migration deploy on ephemeral DB, security and smoke checks before deploy |
| OBS-01 | Telemetry | Observability middleware is registered after major routes | P1 | `app.ts` 122–129 | Middleware order | Register correlation/observability before all API routes and define route-level latency spans |
| AUTH-01 | RBAC | Most admin operations use broad admin role | P1 | route-group middleware | Permission model is sparsely applied | Define least-privilege role/permission matrix and enforce permissions server-side per operation |
| PAY-01 | Payments | Webhook verification can be disabled by missing secret | P1 | public docs webhook | Optional security configuration | Fail startup when payments are enabled without all verification secrets; add idempotency/replay window |
| PERF-01 | Frontend | Large entry/vendor bundles and oversized media | P2 | build and asset inventory | eager pages, broad vendor imports, weak media budgets | Route-level split core pages, defer idle preloads by network quality, optimize responsive AVIF/WebP assets |
| DB-01 | Finance | Monetary values mix Float and Decimal | P2 | supporter/inventory versus finance models | Incremental schema growth | Migrate all money/exchange-rate values to Decimal with tested rounding policy |
| ARCH-01 | Tenancy | No consistent tenant/row ownership boundary | P2 | schema-wide | Single-owner architecture | Add tenant context only before multi-tenant/delegated expansion; enforce in repositories/services |
| UX-01 | Routing | Accidental `/admin/calendar font` route | P3 | `App.tsx` 184 | Typographical artifact | Remove after approval and add route smoke test |
| DX-01 | Quality | 473 ESLint warnings and duplicate auth stores | P2 | lint output/source layout | Warnings allowed indefinitely | Set warning budget to zero gradually; consolidate one auth store/API client |

## 12. P0/P1 remediation plan

### A. Secure Mary and WebRTC resources (SEC-01/02)

Problem → public object access and call mutation.  
Root cause → raw identifiers are capabilities.  
Fix → create a signed, scoped session capability at chat creation; require it for visitor history/mutation/signaling; require JWT plus call permissions for admin answer/notes; verify session participant and transition state.  
Files → `ai.routes.ts`, `ai.controller.ts`, conversation/call services, ChatWidget and CallContext, shared request types.  
Risk → existing browser sessions become invalid.  
Tests → attacker/owner/admin matrix, expired/tampered capability, cross-session IDOR, WebRTC state transition tests.  
Expected result → one visitor cannot access or mutate another visitor's chat/call.

### B. Eliminate stored XSS and harden tokens/uploads (SEC-03/04/05)

Sanitize CMS HTML with a server allowlist and safe link/image rules; render only sanitized output; tighten CSP with nonces/hashes. Move refresh tokens to HttpOnly cookies and keep access tokens short-lived/in memory. Quarantine uploads, inspect magic bytes, scan active formats, and serve private assets through authorized signed URLs. Regression-test malicious HTML/SVG/polyglots and auth refresh/logout flows.

### C. Make Mary failures visible and tests truthful (AI-01, QA-01)

Add provider readiness to health checks, distinguish `degraded` SSE events from model output, stop labelling fallback latency as TTFT, and fail live certification when provider generation fails. Keep deterministic offline tests as a separate suite. Run the required multi-turn corpus against a funded production-equivalent provider and capture per-stage spans, samples, min/max/mean/p95 and grounded-source assertions.

### D. Repair memory/context lifecycle (AI-02/03)

Fetch the newest history window and summarize older context. Move extraction to a durable idempotent job with session version/existence checks. Do not persist inferred facts when provider output is invalid JSON or merely echoes a previous response. Add adversarial tests for corrections, deletion during extraction, ambiguous pronouns and topic changes.

### E. Enforce least privilege and release gates (AUTH-01, OPS-01, OBS-01, PAY-01)

Create a server-side permission map per route/action, move observability middleware before routes, require webhook secrets when payment features are enabled, and make the main workflow run typecheck, lint policy, unit/integration tests, migration/seed on an ephemeral DB, security tests, build and smoke tests. Protect deployment with environment approval and post-deploy health checks.

## 13. Roadmap

**Immediate:** SEC-01/02/03, disable public call controls until fixed, restore funded AI or show degraded status, correct the live quality gate, enforce payment secrets, and place full verification before deployment.

**Short term:** fix context window and extractor lifecycle, introduce granular RBAC, harden tokens/uploads, reorder observability middleware, address high-value React hook warnings, add route/API smoke tests and establish real performance baselines.

**Medium term:** normalize money to Decimal, consolidate auth/data clients, optimize images and entry chunks, move WebRTC signaling/events/jobs to shared durable infrastructure, and add customer portal/support lifecycle coverage.

**Long term:** define tenancy before delegated organizations, formalize domain boundaries and API versioning, introduce event schemas/outbox enforcement, retention/privacy policies, SLOs and capacity tests, and regularly rehearse restore/disaster recovery.

## 14. Changes implemented and before/after

No remediation was implemented because the audit request requires findings to be reviewed first. The only added artifact is this report. Therefore there is no valid before/after remediation measurement yet. Baselines in this report must be rerun after approved fixes under the same environment; successful LLM performance must be measured separately from degraded fallback behavior.

## 15. Final verdict

**NO-GO.** The system has substantial functional breadth and a compilable foundation, but public object-level authorization failures, stored-XSS risk, unauthenticated call control, unavailable AI generation masked by passing tests, and incomplete release gates prevent an honest production-ready declaration. Resolve all P0 items and the P1 availability/auth/release issues, then repeat security, Mary live-quality, full admin browser, payment sandbox, throttled mobile and load tests before reconsidering release.
