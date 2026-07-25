# Change Log — Chamkaga Platform

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] - 2026-07-15
### Status: Production Ready (MVP Release Baseline)

This release establishes the baseline MVP structure for single-agent, single-organization operations. It stabilizes RAG retrieval, WebRTC audio flows, lead intelligence scoring pipelines, and database query optimizations.

#### Added
* **Voice AI WebRTC Signaling:** Installed direct browser-to-browser P2P WebRTC audio channels, incoming call overlay triggers, raw requirements notes editor, and RAG Customer Brief compiles.
* **Decoupled Transcription Interface:** Decoupled simulated transcriptions from core automation rules using a dedicated `ITranscriptionProvider` interface, allowing swap paths for Whisper/Deepgram services.
* **RAG Knowledge Platform:** Created admin control dashboards to add/edit knowledge logs, scan pairwise duplicate similarity ratings on save, and execute manual index update cron operations.
* **Lead Scoring & Temp Intelligence:** Configured LLM prompts and algorithms to evaluate lead engagement (timeline/budget parameters) and classify temperatures (`hot`, `warm`, `cold`).
* **Content AI Document Drafts:** Integrated vector database data templates to outline editable Proposals, Emails, Contracts, and Blog entries prior to checkout.
* **Unified CRM Timeline:** Installed chronological timeline indicators tracking voice calls, квалификации score shifts, and document link clearances.
* **Relational Performance Indexes:** Added 17 indexes to PostgreSQL tables covering relational foreign keys and sorting fields to prevent seq scans.

#### Optimized
* **Frontend Bundle Imports:** Converted dynamic inline API imports inside React components into static imports, clearing Vite's `[INEFFECTIVE_DYNAMIC_IMPORT]` warnings and shaving **63 kB** off the initial load chunk (index size reduced to `843.50 kB`).
* **Unused Code Cleanup:** Audited React tree nodes and permanently deleted abandoned directories (`CalendarPage` and `ReportsPage`).

---

## [0.6.0] - 2026-07-13
### Sprint 2 – Day 1
* **Added:** Presence routing dropdowns, BM25 Knowledge Engine stubs, payment verification mock loops, and payment callback token validations.

---

## [0.5.0] - 2026-06-26
### Phase 8 & 9 Layouts
* **Added:** sticky glassmorphism header, Zustand theme switches, Swahili translations support, and 50+ abstract tech gradient placeholder images.
* **Added:** Timeline milestones, certificates card views, and Strategic concept sections.

---

## [0.1.0] - 2026-06-20
* **Skeleton Setup:** Initial monorepo work, TypeScript configuration files, Express server modules skeletons, and prisma DB migrations baselines.
