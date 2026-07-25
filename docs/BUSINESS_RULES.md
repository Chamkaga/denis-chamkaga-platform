# Denis Business Platform — Master Business Rules & Logic Specification

```
Version: 1.0.0
Last Updated: 2026-07-25
Author: Chief Business Rules Architect
Reviewed By: Denis Chamkaga Steering Committee
Approval Status: APPROVED (Official Project Standard)
Related Documents: [CRM_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/CRM_ARCHITECTURE.md), [DENIS_ASSISTANT_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/DENIS_ASSISTANT_ARCHITECTURE.md), [KNOWLEDGE_GOVERNANCE.md](file:///d:/Projects/denis-chamkaga-platform/docs/KNOWLEDGE_GOVERNANCE.md)
```

---

## 1. Overview & Business Rule Hierarchy

This document defines all non-negotiable business logic, scoring formulas, permission matrices, AI guardrails, payment rules, and automated notification triggers across the Denis Business Platform.

---

## 2. Lead Qualification & Scoring Formula

Every visitor interacting with the platform accumulates a dynamic lead score calculated by the `lead-scoring.ts` backend service:

$$\text{Score} = \text{Base} + S_{\text{onboard}} + S_{\text{services}} + S_{\text{quote}} + S_{\text{meeting}} + S_{\text{call}}$$

| Event Action | Point Value | Business Rationale |
| :--- | :--- | :--- |
| **Complete 3-Step Onboarding** | **+20 points** | Verified contact details (Name, Email, Phone) |
| **Inquire on Service Category** | **+15 points** | Expressed explicit interest in custom software |
| **Request Project Quote** | **+25 points** | High-intent commercial evaluation |
| **Book Consultation Meeting** | **+30 points** | Direct engagement request |
| **Attempt WebRTC Voice Call** | **+35 points** | Immediate decision-maker contact attempt |

### Lead Tier Thresholds
- **Cold Tier (0 - 39 points):** General website browser.
- **Warm Tier (40 - 74 points):** Active prospect; listed in Admin CRM.
- **Hot Tier (75+ points):** High-priority lead; triggers instant email/SMS alert to Denis.

---

## 3. Role-Based Access Control (RBAC) Matrix

| System Resource / Endpoint | `ADMIN` Role | `EDITOR` Role | `VIEWER` Role | Unauthenticated Public |
| :--- | :--- | :--- | :--- | :--- |
| **Public Portfolio & Chat Widget** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Submit Lead / Onboarding** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access |
| **Admin Dashboard Telemetry** | ✅ Full Access | ✅ Full Access | 👁 Read-Only | ❌ Blocked (403) |
| **CMS Content CRUD** | ✅ Full Access | ✅ Full Access | 👁 Read-Only | ❌ Blocked (403) |
| **CRM Leads & Client Conversion** | ✅ Full Access | 👁 Read-Only | 👁 Read-Only | ❌ Blocked (403) |
| **Finance OS (Quotes / Invoices)** | ✅ Full Access | ❌ Blocked | ❌ Blocked | ❌ Blocked (403) |
| **AI Knowledge Ops & Governance**| ✅ Full Access | ❌ Blocked | ❌ Blocked | ❌ Blocked (403) |
| **User & Security Settings** | ✅ Full Access | ❌ Blocked | ❌ Blocked | ❌ Blocked (403) |

---

## 4. AI Handover & Guardrail Rules

1. **Off-Topic Rejection:** Mary must reject queries outside Denis Chamkaga's biography, services, projects, and tech stack.
2. **Confidence Threshold:** Knowledge base context items must have a confidence score $\ge 0.85$ to be included in RAG prompts.
3. **Escalation Rule:** If a lead reaches $\ge 75$ points or requests Denis directly, Mary MUST prompt the visitor for a meeting booking or voice call.

---

## 5. Financial & Document Rules

1. **Quotation Validity Period:** Default quotation validity is **30 days** from generation.
2. **Invoice Immutability:** Once an invoice status transitions to `PAID`, its itemized rows cannot be modified.
3. **Public Token Security:** Public document links (`/public/docs/:token`) use 256-bit cryptographically secure tokens.

---

## 6. Notification Rules

- **Hot Lead Captured:** Dispatches instant notification email via SendGrid/Resend to `admin@denischamkaga.com`.
- **WebRTC Call Incoming:** Triggers audio notification chime inside Admin Console.
- **Quotation Accepted:** Sends notification email and updates status in CRM.
