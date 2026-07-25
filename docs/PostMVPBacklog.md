# Post-MVP Enterprise Backlog — Chamkaga Platform

This backlog outlines the prioritized backlog items scheduled for development cycles following the MVP sign-off.

---

## Priority 1: Content AI Generators
* **Objective:** Complete the document generator suite (Blogs, Emails, Proposals, Case Studies, and Tech Docs).
* **Scope:** 
  * Build a React-based rich-text content editor (e.g. TipTap) in the admin console.
  * Integrate LLM prompts using vector database contexts to auto-draft blogs, contracts, and case studies.
  * Provide inline editing, history versioning, and download as PDF/Markdown.
* **Dependencies:** MVP baseline (`v1.0.0-mvp`).
* **Acceptance Criteria:**
  * Admin can select "Blog Post", type a prompt, and get a generated article using vector database facts.
  * Generated documents must support inline edits before saving.
  * Admin can export generated documents to standard PDF templates.

---

## Priority 2: Business Automation retry pipelines
* **Objective:** Implement server-side background job monitoring and failed process recovery.
* **Scope:**
  * Set up Redis and BullMQ inside backend.
  * Convert automated events (Lead created, Email dispatched, CRM Sync triggered) into asynchronous jobs.
  * Implement retry backoffs, failure queues, and administrator alert logs.
* **Dependencies:** Redis container infrastructure.
* **Acceptance Criteria:**
  * Temporary network drops during API requests (e.g. SMTP) do not cause data loss.
  * Failed operations retry 3 times with exponential backoff before logging to the Admin Ops Console.

---

## Priority 3: Communication Center
* **Objective:** Centralize all user chats, emails, and call activities into a single inbox.
* **Scope:**
  * Build a unified inbox frontend layout under `/admin/communication`.
  * Display all chat logs, voicemail transcripts, and email threads in one chronological feed.
  * Allow Denis to reply directly to user emails and message queries from the admin screen.
* **Dependencies:** Priority 1 (Content AI email dispatchers).
* **Acceptance Criteria:**
  * Admin can inspect a customer profile and see all corresponding call summaries, SMS triggers, and email conversations in one timeline view.

---

## Priority 4: Client Portal
* **Objective:** Allow external clients to securely inspect proposals, sign contracts, and pay invoices.
* **Scope:**
  * Build a public-facing portal layout requiring token hashes or secure OTPs.
  * Implement DPO Group and Flutterwave payment gateways in production mode.
  * Build electronic contract signature capture.
* **Dependencies:** Priority 1 (Content AI contract generators) and database index configurations.
* **Acceptance Criteria:**
  * Client receives secure invoice link via email, clicks, reviews details, inputs details, and completes checkout.
  * Database automatically writes a `Payment` activity, recalculates outstanding invoice balance, and sets status to Paid.

---

## Priority 5: Analytics Intelligence
* **Objective:** Audit system token usage, LLM latencies, and conversion stats.
* **Scope:**
  * Add telemetry metrics tracking tables.
  * Build visual interactive charts (Recharts) in the admin reports tab.
* **Dependencies:** Priority 3 (Communication Center).
* **Acceptance Criteria:**
  * Admin can check weekly token consumption, average AI response latencies, and lead-to-opportunity conversions.

---

## Priority 6: Platform Operations (Multi-Tenant SaaS)
* **Objective:** Expand the codebase to host multiple business organizations.
* **Scope:**
  * Add `organizationId` and `tenantId` to all models in `schema.prisma`.
  * Support multiple agents, round-robin assignments, and billing subscription tiers.
* **Dependencies:** Multi-process event brokers (BullMQ).
* **Acceptance Criteria:**
  * Database rows are partitioned. Tenant A administrators cannot query or access data from Tenant B.

---

## Priority 7: Enterprise Hardening
* **Objective:** Standardize security, caching, and horizontal scaling.
* **Scope:**
  * Migrate the in-memory event bus to Redis Pub/Sub.
  * Deploy a production-ready Coturn TURN/STUN server relay for global WebRTC media traffic.
* **Dependencies:** Priority 6 (Multi-Tenant).
* **Acceptance Criteria:**
  * Multiple Node server containers can run in parallel, syncing events and audio call alerts in real-time.

---

## Priority 8: Mobile Applications
* **Objective:** Wrap public and admin services into native mobile shells.
* **Scope:**
  * Create Capacitor/React Native bindings.
  * Implement system push notifications for incoming call rings.
* **Dependencies:** Priority 7 (STUN/TURN WebRTC).
* **Acceptance Criteria:**
  * Denis receives incoming voice call rings directly on his mobile phone lock screen when a visitor clicks "Call Denis".

---

## Priority 9: Future AI Capabilities
* **Objective:** Implement autonomous multi-agent systems.
* **Scope:**
  * Set up task planning loops where agents coordinate.
  * Add direct WebSockets WebRTC audio completions (OpenAI Realtime API).
* **Dependencies:** Priority 7 (STUN/TURN WebRTC).
* **Acceptance Criteria:**
  * Call widget connects directly to a conversational voice agent with sub-second audio response latencies.
