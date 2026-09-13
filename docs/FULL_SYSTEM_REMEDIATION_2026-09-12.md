# Full System Remediation Evidence — 12 September 2026

## Verdict

**NO-GO**

The code-level P0 containment and regression gates described below pass. Production approval remains blocked because the live OpenAI certification failed with HTTP 429, a real malware scanner is not yet connected, and payment sandbox/webhook verification has not been certified against the production provider configuration. A successful build or deterministic fallback is not treated as production evidence.

## Evidence snapshot

| Gate | Result | Evidence |
| --- | --- | --- |
| TypeScript | PASS | Backend and frontend `tsc --noEmit` completed successfully on 12 September 2026. |
| Strict lint | PASS | `npm run lint:ci` completed with `--max-warnings 0`. |
| Production build | PASS | Shared, backend, and Vite production builds completed successfully. |
| Prisma validation | PASS | Schema valid; four migrations found; local database up to date. |
| Security regression suite | PASS | Conversation isolation, admin access, capability expiry/tamper/missing cases, WebRTC internal-note denial, stored XSS, and memory deletion race passed. |
| Mary offline deterministic gate | PASS | 6/6 scenarios and 23/23 turns passed. This is explicitly labelled offline and is not an AI provider certification. |
| Mary live provider gate | FAIL | OpenAI `gpt-4o-mini` returned HTTP 429/no credits. `generationMode=fallback`, `success=false`, `PROVIDER_RATE_LIMITED`, and `liveTtftMs=null`. |
| Dependency vulnerability audit | NOT RUN | Registry access needs explicit authorization; no result is claimed. |

## Finding map

### SEC-01 — Mary conversation object authorization

Status: **Remediated and regression tested.**

Mary now issues a signed, expiring capability scoped to one visitor and one conversation. Every public history, download, rename, close, delete, attachment, and call operation validates that capability. Raw session IDs no longer grant access. Administrative access follows the separately authenticated active-user path. Regression tests cover visitor A versus visitor B, missing, expired, forged/tampered capabilities, valid ownership, and active administrator access.

Key modules: `backend/src/ai/session-capability.service.ts`, `backend/src/middleware/conversation-access.middleware.ts`, `backend/src/routes/ai.routes.ts`, `frontend/src/components/organisms/ChatWidget/ChatWidget.tsx`, and `frontend/src/services/api.ts`.

### SEC-02 — WebRTC and call operations

Status: **Remediated at the application boundary and regression tested.**

Offer, ICE, call logging, and state mutation require the session capability or authorized administrator access. Public answer creation is rejected, internal Denis notes are administrator-only, and call state transitions use an explicit transition matrix. The public attachment route is also bound to its Mary session.

Key modules: `backend/src/controllers/ai.controller.ts` and `backend/src/routes/ai.routes.ts`.

### SEC-03 — Stored XSS

Status: **Remediated and regression tested.**

Blog HTML is sanitized on CMS write and again on public read using a strict allowlist, safe URL protocols, restricted image handling, and removal of scripts, event handlers, SVG payloads, and JavaScript URLs. The inline theme bootstrap moved to a static script and CSP no longer requires `unsafe-inline` for scripts.

Key modules: `backend/src/utils/html-sanitizer.ts`, blog services/controllers, `frontend/index.html`, and `frontend/public/theme-init.js`.

### AI-01 and QA-01 — Provider readiness and truthful certification

Status: **Application behavior remediated; live certification blocked.**

Provider responses identify provider, model, mode, and classified failure. Requests have bounded retry/timeout behavior and a circuit breaker. Health/readiness exposes provider degradation. The UI identifies controlled degraded responses, telemetry distinguishes fallback first-token timing from live LLM TTFT, and the live gate exits nonzero on provider failure. Current live success rate is **0% (0/1 certification requests)** because the configured OpenAI account returned HTTP 429.

### AI-02 — Asynchronous memory

Status: **Remediated and deletion-race tested.**

Memory extraction now uses a durable Prisma job with idempotency keys, claim state, bounded retries, dead-letter/cancelled states, stale-worker recovery, session/version checks, strict structured extraction, and audit activities for terminal outcomes. A deleted or advanced conversation cannot receive stale facts. Summarization reads a bounded recent window rather than the complete conversation.

Key modules: `backend/src/ai/memory-job.service.ts`, `backend/src/ai/extractor.ts`, and migration `20260910120000_add_ai_memory_jobs`.

### AI-03 — Context management and Mary capability architecture

Status: **Remediated for the audited retrieval/context defect; deterministic scenarios pass.**

The context engine reads newest messages and restores chronological prompt order. It combines recent messages, bounded older-message summary, confirmed facts, business type/problem/topic/intent, previous assistant question, pending reference, and lead state. Short follow-ups use recent context for retrieval. Pricing is accessed through a capability backed by the shared authoritative pricing map instead of hardcoded prompt branches.

### SEC-04 — Authentication/token hardening

Status: **Substantially remediated; browser deployment validation remains.**

Refresh credentials use Secure production, HttpOnly, SameSite cookies with CSRF validation and rotation/revocation. The frontend no longer persists newly issued refresh tokens and sends cookie/CSRF credentials. Server authorization revalidates the active user and role. Duplicate frontend auth stores were consolidated. Access-token migration to memory is staged conservatively to preserve existing sessions and still needs browser-level production validation.

### SEC-05 — Upload security

Status: **Partially remediated; release blocker remains.**

Uploads validate size, extension, MIME, and magic bytes in quarantine; SVG is rejected; private Mary attachments are not statically exposed. Remote DAM imports are HTTPS-only, reject credentials/private DNS destinations, pin the validated address, cap streamed size, restrict extensions, and run content validation. Archive acceptance requires the malware-scanner feature configuration. A real malware-scanning/quarantine service and authorized private-download endpoint remain required before GO.

### PAY-01 — Payment security

Status: **Code paths hardened; provider certification remains.**

Enabled production payment readiness fails when DPO credentials are absent or sandbox mode is enabled. Webhooks reject missing verification secrets and invalid signatures. Payment posting checks uniqueness/idempotency, positive amount, invoice balance, currency, and payment state, and DPO TLS verification cannot be disabled. Production sandbox/webhook replay certification and provider-side evidence remain required.

### AUTH-01 — Admin RBAC

Status: **Remediated at server routes; expanded regression matrix recommended.**

CRM, finance, knowledge, projects, media, marketing, supporters, AI/calls, and calendar use resource/action permissions with a super-admin owner bypass. Sensitive actions such as payment verification and project management have dedicated permissions. Frontend visibility remains UX only; the backend is the enforcement boundary.

### OPS-01 and OBS-01

Status: **Release gate and middleware order remediated; real deployment check remains.**

CI now runs install, typecheck, strict lint, tests/security gates, Prisma validation/migration, build, Docker validation, and artifact generation before deployment eligibility. The corrected `lint:ci` script passes arguments directly to ESLint. Correlation and security middleware execute before observability and routes. Mary telemetry records intent, retrieval, prompt, provider, first-token classification, persistence, and total timing. A target-environment deployment and post-deployment health action still require deployment credentials/environment ownership.

### Performance

Status: **Measured bundle improvement; full production performance certification pending.**

Public routes were split and heavy spreadsheet/PDF dependencies isolated. The main bundle changed from 318.98 kB raw / 80.07 kB gzip to 232.11 kB raw / 59.26 kB gzip, a 25.99% gzip reduction. The general vendor bundle changed from 517.08 kB raw / 164.17 kB gzip to 233.20 kB raw / 69.51 kB gzip; spreadsheet code is a separate lazy 94.33 kB gzip chunk. Fresh page-by-page mobile/desktop field measurements, backend endpoint percentiles, and successful live Mary P50/P95/P99 are still required.

### Database and future tenancy

Status: **Targeted financial migration complete; tenancy remains a planned boundary.**

Audited monetary and exchange-rate fields now use explicit Prisma Decimal precision through migration `20260910130000_use_decimal_for_financial_fields`; service conversion points were updated. The platform remains a documented single-owner system. New authorization and conversation records use explicit ownership scopes without attempting a risky full tenant migration.

### End-to-end business flows

Status: **Local integration flows pass; external-provider certification remains.**

The following database-backed and HTTP flows were executed after remediation:

| Flow suite | Result |
| --- | --- |
| Mary lead → WebRTC → call notebook → consultation → quotation → invoice → payment → receipt/ledger | PASS, 7/7 phases |
| Full visitor/customer → CRM → quotation → project → payment → supporter → dashboard lifecycle | PASS, 13/13 checks |
| Owner lead → consultation → organization/client → quote → invoice → payment → receipt → expense → P&L/dashboard | Business assertions PASS, 14/14; the legacy runner exposed a Windows process-shutdown defect after completion. |
| Finance ERP: chart of accounts, balanced journal rejection, expenses, event postings, P&L/balance sheet | PASS, 13/13 |
| Project workspace: quote conversion, milestones/tasks, progress, time, files, risk and profitability | PASS, 13/13 |
| Marketing: consent, audience, campaign, journey, grounded content, assets, ROI and timeline | PASS, 12/12 |
| Supporter/collaborator → financial ledger → CRM synchronization | PASS, 17/17 |
| Business acceptance: lead-to-delivery, returning-customer context, contact-to-admin event | PASS, 9/9 |
| Admin authentication: invalid login, valid login, profile authorization and refresh rotation | PASS, 12/12 using an isolated temporary super-admin account that is removed after the test. |
| Dynamic CMS knowledge update → cache invalidation → Mary prompt | PASS after preserving provider relevance scores; the certification now exits nonzero when the assertion fails. |

The test corrections do not alter production account passwords. They remove hardcoded admin credentials, use isolated test records, correctly clean up audit records, and prevent a printed failure from returning exit code zero.

## Regression and remaining risks

The relevant typecheck, build, strict lint, Prisma, security, and offline Mary suites pass. Existing public, admin, CRM, finance, project, content, and Mary contracts were preserved through additive middleware, services, migrations, and frontend capability transport.

The following evidence is still required before changing the verdict:

1. Fund/enable the configured AI provider and obtain a statistically useful successful live sample with grounded-response validation and true TTFT/total P50, P95, and P99.
2. Connect and verify a real malware scanner plus authorized private-file downloads.
3. Run DPO sandbox and signed webhook replay tests using provider-issued test credentials, then confirm production readiness secrets without recording them.
4. Execute the release workflow in the target environment, including migration rehearsal, smoke tests, deployment, and post-deployment health checks.
5. Capture fresh page-by-page desktop/mobile and backend endpoint performance measurements in a production-like environment.
6. Complete the dependency vulnerability audit after registry access is authorized.

## Final verdict

**NO-GO**
