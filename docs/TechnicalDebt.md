# Technical Debt Register — Chamkaga Platform

This register documents known architectural shortcuts, mock integrations, and optimization tasks that are deferred for post-MVP cycles.

---

## 1. High Priority (Must Address First in Next Sprint)

### A. Dynamic Import Warnings & Bundle Splits
* **Description:** Vite warning concerning `api.ts` was resolved by converting inline dynamic imports in `ChatWidget.tsx` and `CallContext.tsx` to static imports.
* **Impact:** Resolved, but the initial main chunk (`index.js` at `843.50 kB`) remains relatively large because shared libraries (Lucide React, Framer Motion, TanStack Query) are loaded statically.
* **Remediation:** Further refactor chunk definitions inside `vite.config.ts` using rolldown manual code-splitting options to separate vendor dependencies.

### B. Concurrent Database Counts
* **Description:** The `getDashboardStats()` service method in `admin.service.ts` runs 26 database queries concurrently via `Promise.all`.
* **Impact:** Excellent latency currently (~15-50ms) but will create PostgreSQL connection bottlenecks when table row counts grow over time.
* **Remediation:** Refactor queries to utilize single SQL aggregation group-bys (`SELECT COUNT(*)... GROUP BY`) or implement a caching mechanism (e.g. Memory Cache with 5-minute TTL).

---

## 2. Medium Priority (Architecture & Code Polish)

### A. Isolated Transcription Mock Provider
* **Description:** Real voice calls are browser-to-browser WebRTC streams (P2P). Because raw audio does not hit the backend server, the server generates simulated summaries upon hangup.
* **Impact:** Safe for MVP operations, but requires swapping in a real audio-recording upload client-side and Whisper/Deepgram STT API integrations in the backend for true transcription.
* **Remediation:** Integrate a client-side media recorder that packages and uploads audio binary streams on call termination, then trigger the backend `OpenAIWhisperProvider` to process it.

### B. Outbound Email Logger Fallback
* **Description:** Nodemailer automatically logs email content to the local console if SMTP environment variables are missing.
* **Impact:** Convenient for development, but risks silent failures in production if credentials expire or break.
* **Remediation:** Configure a fallback delivery mechanism (like SendGrid or Amazon SES SDK) and add explicit admin dashboard notifications if an email dispatch fails.

### C. CommonJS Inline Statement
* **Description:** `upload.routes.ts` uses `const fs = require('fs')` inline inside a modern ES Modules context.
* **Impact:** Stylistic inconsistency.
* **Remediation:** Convert to `import fs from 'fs'` at the top of the file.

---

## 3. Low Priority (Enterprise Scaling & Future Workforce)

### A. Pub/Sub and Event Bus Migration
* **Description:** The central `aiEventBus` is an in-memory Node `EventEmitter`.
* **Impact:** Cannot scale horizontally across multiple node processes or server instances.
* **Remediation:** Migrate the event broker to Redis Pub/Sub or a dedicated queue manager (e.g. BullMQ) for distributed enterprise architectures.

### B. Multi-Agent & Multi-Tenant Isolation
* **Description:** The platform schema assumes a single business organization (single tenant) and a single admin (Denis).
* **Impact:** Restricts corporate expansion.
* **Remediation:** Introduce `organizationId` and `tenantId` gates across all middleware, refactor auth roles scopes, and design round-robin routing logic for agent assignment.
