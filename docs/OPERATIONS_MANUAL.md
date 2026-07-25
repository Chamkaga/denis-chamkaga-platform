# Denis Business Platform — Admin Operations Manual & User Guide

```
Version: 1.0.0
Last Updated: 2026-07-25
Author: Lead Systems Operations Specialist
Reviewed By: Denis Chamkaga Operations Directorate
Approval Status: APPROVED (Official Project Standard)
Related Documents: [ADMIN_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/ADMIN_ARCHITECTURE.md), [CRM_ARCHITECTURE.md](file:///d:/Projects/denis-chamkaga-platform/docs/CRM_ARCHITECTURE.md), [KNOWLEDGE_GOVERNANCE.md](file:///d:/Projects/denis-chamkaga-platform/docs/KNOWLEDGE_GOVERNANCE.md)
```

---

## 1. Overview & Operational Scope

This **Operations Manual** serves as the step-by-step administrative guide for Denis Chamkaga and system managers operating the Admin Console (`/login` & `/admin/*`).

---

## 2. Managing CMS Content

### 2.1 Publishing Portfolio Projects
1. Navigate to **Admin Console → Portfolio CMS** (`/admin/cms`).
2. Click **Create Project** button.
3. Enter Project Title, Slug, Category, Description, Tech Stack Tags, Image URLs, and Live Link.
4. Set status to `PUBLISHED` and click **Save**. The project immediately appears on the public `/projects` page.

---

## 3. Managing CRM Leads & Finance OS

### 3.1 Reviewing Incoming Leads & Qualification Tiers
1. Navigate to **Admin Console → Business CRM** (`/admin/crm`).
2. Filter leads by status or qualification tier (**Hot / Warm / Cold**).
3. Click a lead row to view conversation history, captured contact details, and lead score breakdown.

### 3.2 Creating & Emailing Quotations
1. Select a qualified lead and click **Convert to Client**.
2. Click **Create Quotation**.
3. Add itemized service rows, pricing, tax rate, and currency (`TZS` / `USD`).
4. Click **Generate & Email PDF**. The client receives an email containing a secure online view link (`/public/docs/:token`).

---

## 4. AI Knowledge Base Operations & Governance

### 4.1 Adding Verified Knowledge Items
1. Navigate to **Admin Console → AI Knowledge Ops** (`/admin/ai-knowledge`).
2. Click **Add Knowledge Entry**.
3. Fill Title, Content Chunk, Category, and Citation Source.
4. Click **Submit for Review**. The system verifies duplicate status and assigns a confidence score.
5. Click **Approve & Index**. The item becomes available for Mary's RAG context queries.
