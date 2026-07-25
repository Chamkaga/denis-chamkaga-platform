# Denis Business Platform (Enterprise Edition)

[![Release](https://img.shields.io/badge/release-v1.0.0--candidate-violet.svg?style=for-the-badge)](https://github.com/Chamkaga/denis-chamkaga-platform/releases)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg?style=for-the-badge)](https://github.com/Chamkaga/denis-chamkaga-platform)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=for-the-badge)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Prisma](https://img.shields.io/badge/Prisma-6.0+-2D3748.svg?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

The **Denis Business Platform** is an enterprise-grade digital business system integrating a high-converting client portfolio, the **Denis Assistant AI Ecosystem**, a real-time **CRM & Lead Qualification Engine**, a tokenized **Finance OS**, and a comprehensive **Admin Operations Console**.

---

## 🏛️ System Architecture

```
[ Homepage & Floating Chat Widget ]
                │
                ▼
[ Mary — AI Persona (RAG & WebRTC Voice) ]
                │
                ▼
[ Lead Qualification Engine (Dynamic Scoring 0–100) ]
                │
                ▼
[ Finance OS (Quotations, Invoices, Flutterwave/DPO) ]
                │
                ▼
[ Admin Console (CMS, CRM, AI Ops & Audit Logs) ]
```

---

## 🌟 Key Platform Modules

1. **Client Portfolio & Public Web App:** Built with React 19, Vite, TypeScript, Tailwind CSS, and Framer Motion. Includes full dark/light glassmorphic themes, WCAG AA accessibility, and zero-delay navigation.
2. **Denis Assistant AI Ecosystem:** Powered by OpenAI GPT models and RAG knowledge retrieval ($\ge 0.85$ confidence threshold). Features Mary (Customer Service), instant lead scoring, meeting scheduling, and WebRTC voice escalation.
3. **CRM & Business Engine:** Automated lead qualification, activity timeline tracking, client lifecycle management, and automated email/WhatsApp notifications.
4. **Finance OS:** Dynamic project quote generation, tokenized public quotation views, automated invoice calculation, and multi-gateway payments (Flutterwave & DPO).
5. **Admin Operations Console:** RBAC-protected management console for CMS (Projects, Services, Blog), CRM, AI Knowledge Governance, System Settings, and Immutable Audit Logging.

---

## 📚 Official Documentation Suite (`/docs`)

This repository follows a strict **Documentation-As-Code** policy. The `/docs` directory is treated as production source code and contains 20 single-source-of-truth specification documents:

- [`PRODUCT_SPECIFICATION.md`](docs/PRODUCT_SPECIFICATION.md) — Master Product Vision, Personas, Roadmaps & KPIs.
- [`DESIGN_SYSTEM.md`](docs/DESIGN_SYSTEM.md) — UI Tokens, Typography, Glassmorphism & Micro-animations.
- [`INFORMATION_ARCHITECTURE.md`](docs/INFORMATION_ARCHITECTURE.md) — Site Map, Page Hierarchy & Routing Map.
- [`COMPONENT_LIBRARY.md`](docs/COMPONENT_LIBRARY.md) — Component Specifications & Accessibility Rules.
- [`UI_FLOW.md`](docs/UI_FLOW.md) — Screen Wireflows & State Transitions.
- [`CHAT_WIDGET_ARCHITECTURE.md`](docs/CHAT_WIDGET_ARCHITECTURE.md) — Floating Chat Widget Architecture & Onboarding.
- [`DENIS_ASSISTANT_ARCHITECTURE.md`](docs/DENIS_ASSISTANT_ARCHITECTURE.md) — AI Ecosystem Blueprint, RAG & Voice Handover.
- [`CRM_ARCHITECTURE.md`](docs/CRM_ARCHITECTURE.md) — CRM Engine, Lead Scoring & Finance OS.
- [`ADMIN_ARCHITECTURE.md`](docs/ADMIN_ARCHITECTURE.md) — Admin Console, CMS, Analytics & Audit Logs.
- [`DATABASE_SCHEMA.md`](docs/DATABASE_SCHEMA.md) — Prisma Models, Indexing & Data Integrity.
- [`API_REFERENCE.md`](docs/API_REFERENCE.md) — REST Endpoints, Streaming SSE & RFC 7807 Errors.
- [`SYSTEM_ARCHITECTURE.md`](docs/SYSTEM_ARCHITECTURE.md) — End-to-End System Blueprint & Developer Mandate.
- [`BUSINESS_RULES.md`](docs/BUSINESS_RULES.md) — Lead Scoring Formulas, RBAC & AI Guardrails.
- [`SECURITY_ARCHITECTURE.md`](docs/SECURITY_ARCHITECTURE.md) — OWASP Top 10 Safeguards & JWT Rotation.
- [`DEPLOYMENT_ARCHITECTURE.md`](docs/DEPLOYMENT_ARCHITECTURE.md) — Docker Compose, Nginx SSL Proxy & Backups.
- [`TESTING_STRATEGY.md`](docs/TESTING_STRATEGY.md) — Test Pyramid & Automated Verification Scripts.
- [`OPERATIONS_MANUAL.md`](docs/OPERATIONS_MANUAL.md) — Step-by-Step Admin Operations Manual.
- [`CONTRIBUTING.md`](docs/CONTRIBUTING.md) — Developer Setup & Conventional Commits.
- [`DECISION_LOG.md`](docs/DECISION_LOG.md) — 12 Architectural Decision Records (ADRs).
- [`KNOWLEDGE_GOVERNANCE.md`](docs/KNOWLEDGE_GOVERNANCE.md) — AI Knowledge Governance & Version Control.

---

## 🛠️ Quick Start & Local Setup

### Prerequisites
- Node.js `v22.0.0+`
- PostgreSQL `v16+`
- Redis `v7+`

### Installation
```bash
# Clone the repository
git clone https://github.com/Chamkaga/denis-chamkaga-platform.git
cd denis-chamkaga-platform

# Install root & workspace dependencies
npm install

# Setup backend environment
cp backend/.env.example backend/.env

# Run database migrations and seed system defaults
cd backend
npx prisma migrate dev
npx prisma db seed
```

### Running Locally
```bash
# Run both Frontend and Backend concurrently from root
npm run dev
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) — see the LICENSE file for details.
