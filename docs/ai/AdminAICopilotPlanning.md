# Phase 2 – Admin AI Copilot Planning Package

```text
Enterprise Planning Package

Phase: Phase 2 - Admin AI Copilot
Version: v1.0.0
Status: Pending Review / Ready for Approval
Owner: Denis Chamkaga Platform
Last Updated: 2026
Next Milestone: Phase 2 Kickoff Approval
```

---

## 1. Phase 2 Product Backlog (Epics & User Stories)

To guide the development of the Admin AI Copilot, the backlog is categorized into six high-value epics:

### Epic 1: AI Dashboard (System Summary & Insights)
*   **User Story 1.1:** As an Admin, I want the AI to generate a daily textual summary of business metrics, new leads, and support contributions so that I can get an instant platform overview.
*   **User Story 1.2:** As an Admin, I want the AI to analyze pending tasks and recommend prioritized actions (e.g., *"Approve partnership request CTR-2026-0004"*).

### Epic 2: Knowledge AI (Context & File Search)
*   **User Story 2.1:** As an Admin, I want to query the AI about specific documents, blog draft statuses, and project files using natural language.
*   **User Story 2.2:** As an Admin, I want the AI to retrieve system guidelines and Coding Standards to assist in engineering checks.

### Epic 3: CRM AI (Lead Scoring & Communication)
*   **User Story 3.1:** As an Admin, I want the AI to automatically analyze and score incoming leads from the contact forms (Cold, Warm, Hot) based on intent and business profiles.
*   **User Story 3.2:** As an Admin, I want the AI to draft email and WhatsApp follow-up replies for partnerships and customer inquiries.

### Epic 4: Content AI (Blog & Portfolio Management)
*   **User Story 4.1:** As an Admin, I want the AI to outline, draft, and optimize new blog posts or project case studies based on technical specs I provide.
*   **User Story 4.2:** As an Admin, I want the AI to audit SEO tags and metadata across public pages.

### Epic 5: Document AI (Automated Invoicing & Quotations)
*   **User Story 5.1:** As an Admin, I want to command the AI to pre-populate invoices (`INV`) or quotations (`QTN`) for specific clients based on brief chat summaries.
*   **User Story 5.2:** As an Admin, I want the AI to review draft agreements for potential naming errors or missing line items.

### Epic 6: Analytics AI (Reconciliation & Trend Analysis)
*   **User Story 6.1:** As an Admin, I want the AI to cross-reference payment logs (e.g. DPO gateway logs vs. SupportContribution database states) to highlight pending mismatches.
*   **User Story 6.2:** As an Admin, I want the AI to plot monthly support conversion trends and project future growth rates.

---

## 2. AI Functional Specification

The Admin AI Copilot operates as an assistant panel integrated into the private Admin Console. The interaction loop is strictly governed by the following workflow:

```
                  ┌──────────────────────────────┐
                  │ Admin Opens Admin Console   │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │ AI Engine Gathers Context    │
                  │ (CRM, Dashboard, Logs, Docs) │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │ AI Generates Daily Summary  │
                  │ & Prioritized Actions List   │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │ Admin Inputs Prompt/Question │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │ AI Analyzes Intent & Calls   │
                  │ Sandbox Tool (Draft/Query)   │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │ AI Presents Draft / Option   │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │ Admin Reviews, Edits, and    │
                  │ Clicks "Approve / Execute"   │
                  └──────────────┬───────────────┘
                                 ▼
                  ┌──────────────────────────────┐
                  │ System Executes Action       │
                  │ (Send Email, Create Invoice) │
                  └──────────────────────────────┘
```

---

## 3. AI Permission Matrix

To maintain absolute system safety, permissions are partitioned between read-only activities, safe actions, and restricted destructive modifications. **Restricted actions require explicit human approval (No Autonomous Execution).**

| Service / Action | AI Capability | Permission Level | Human Approval Required |
|:---|:---|:---|:---|
| **System Settings** | Read site config | Allowed (Read) | No |
| **System Settings** | Modify configuration | Disallowed | YES (Admin console form) |
| **CRM Leads** | Classify & Score leads | Allowed (Write) | No |
| **CRM Leads** | Delete lead profile | **Restricted** | **YES (Admin MFA required)** |
| **Invoices / Quotes** | Draft invoice/quote | Allowed (Write) | YES (Admin review draft) |
| **Invoices / Quotes** | Delete Invoice | **Restricted** | **YES (Accounting Override)** |
| **Financial Contributions** | View completed logs | Allowed (Read) | No |
| **Financial Contributions** | Approve pending / Manual edit | **Restricted** | **YES (Admin Ledger Override)** |
| **Outbox Channels** | Draft Email / WhatsApp | Allowed (Write) | YES (Admin clicks Send) |
| **Database Schemas** | Read schemas/seeds | Allowed (Read) | No |
| **Database Schemas** | Execute migration / seed | Disallowed | **YES (Manual CLI only)** |

---

## 4. Knowledge Source Architecture

The Copilot reads from designated data vectors to construct its contextual window:

*   **CRM Database:** Lead details, contact timelines, customer lifecycle states.
*   **Support Contributions:** Completed transaction ledger entries, notes, and volunteer records.
*   **Projects & Portfolio:** Completed projects list, technology tag metadata.
*   **Financial Documents:** Historic invoice list, active quotations, item price guides.
*   **Platform Content:** Blog draft repository, site information, public FAQ files.
*   **System Knowledge:** Platform Architecture maps, Coding Standards guidelines, dev logs.

---

## 5. Human Approval Workflows

The platform enforces a strict **"Human-in-the-Loop" (HITL)** validation pattern for all mutative tasks:

```
[ AI Engine ] ──► (Generates Draft / Proposal) ──► [ Render Review Modal ]
                                                          │
                                                          ▼
                                                 [ Admin Edits / Reviews ]
                                                          │
                                       ┌──────────────────┴──────────────────┐
                                       ▼                                     ▼
                                  [ Approved ]                           [ Rejected ]
                                       │                                     │
                                       ▼                                     ▼
                              [ Execute Action ]                    [ Adjust Prompt / Exit ]
```

Actions requiring this flow include:
*   Sending outbox emails or WhatsApp notifications.
*   Finalizing Invoice (`INV`) or Quotation (`QTN`) records.
*   Updating blog statuses to `Published`.
*   Changing database contribution records manually.

---

## 6. AI Tool Registry

The AI accesses specialized tool abstractions mapped to core services:

*   `knowledgeSearch(query)`: Query the local documentation vector database.
*   `crmSearch(criteria)`: Retrieve customer contact histories or qualify metrics.
*   `draftInvoice(clientId, lineItems)`: Create a draft `INV` ledger entry.
*   `draftQuotation(clientId, lineItems)`: Create a draft `QTN` record.
*   `generateReport(metricType, dateRange)`: Retrieve metrics and assemble charts.
*   `draftEmail(recipient, subject, body)`: Prepare an outbox email draft.
*   `createTask(taskTitle, assignee)`: Log an administrative to-do task.

---

## 7. Prompt Standards

Prompts are standardized as isolated modules within the codebase to guarantee output consistency and ease testing:

*   **System Prompt:** Core instructions detailing the persona of the Copilot, its limitations, security boundaries, and strict formatting templates.
*   **Business Summary Prompt:** Guidelines on compiling metrics, calculating monthly trends, and prioritizing admin tasks.
*   **CRM Communication Prompt:** Standard tone, formatting, and cultural localizations (Swahili and English) for client messaging.
*   **Content Generation Prompt:** Strict formatting rules for drafting Markdown files, SEO metadata, and project posts.
*   **Code Review Prompt:** Verification standards for reviewing code inputs against [CodingStandards.md](file:///d:/Projects/denis-chamkaga-platform/docs/CodingStandards.md).

---

## 8. AI Memory Architecture

The Copilot maintains state memory through partitioned contexts:

*   **Conversation Memory:** Short-term chat history stored in local session variables.
*   **Knowledge Memory:** Embeddings of system architectures, files, and templates indexed via PostgreSQL pgvector or equivalent search drivers.
*   **Business Memory:** Shared configuration configurations, client catalog prices, and product preset standards.
*   **User Preferences:** Customized dashboard arrangements, theme settings, and preferred languages (Swahili / English).

---

## 9. Development Milestones & Sprint Plan

### Milestone 1: Setup & AI Framework Integration (Sprint 1)
*   Integrate LangChain / AI provider wrappers into the backend.
*   Establish `ContributionAIService` interface structure.
*   Write abstract tool interfaces (`knowledgeSearch`, `crmSearch`).

### Milestone 2: Context Extraction & Dashboard (Sprint 2)
*   Build backend vectors for doc ingestion.
*   Establish dashboard context summarizer prompt.
*   Render AI Chat panel in Admin Console GUI.

### Milestone 3: CRM & Communications (Sprint 3)
*   Implement automatic lead scoring triggers.
*   Configure the draft draft email outbox pipeline.
*   Verify output logs in English and Swahili.

### Milestone 4: Human-in-the-Loop & Document Generation (Sprint 4)
*   Implement draft invoice and quote pre-population tools.
*   Build the confirmation and editing modal within the Admin GUI.
*   Audit permissions and block autonomous modifications.

### Milestone 5: Analytics & Validation (Sprint 5)
*   Add analytics summary tools and log analysis handlers.
*   Run validation builds and run system safety integration testing.
*   Deliver the final Phase 2 UAT report.
