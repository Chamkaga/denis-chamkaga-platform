# Denis Chamkaga Platform – Administrator Operating Manual

This manual provides operating instructions for system administrators, CRM managers, content creators, and finance personnel.

---

## 1. Logging into the Admin Console

- **URL**: `http://localhost:5173/login` (or `https://denischamkaga.com/login`)
- **Credentials**: Enter assigned email and password from [test-accounts.md](file:///C:/Users/denis/.gemini/antigravity-ide/brain/d77dbc39-a6bd-4504-ad33-86c847d1efd2/test-accounts.md).
- **First Login**: You will be prompted to reset your temporary password immediately.

---

## 2. Operating Platform Modules

### 📊 Dashboard (`/admin/dashboard`)
Displays high-level KPI cards: Qualified Leads, Active Projects, Approved Quotations, Gross Revenue, and Recent Activity Feed.

### 💼 Portfolio CMS (`/admin/content`)
- **Create Project**: Click **+ Add Project**, fill out title, slug, category, tech stack tags, and client URL.
- **Edit / Archive**: Modify content or toggle visibility status (Draft, Published, Archived).

### 🧠 Knowledge CMS (`/admin/knowledge`)
- Manage 17 enterprise knowledge domains for Mary AI.
- View RAG embedding status and manual knowledge synchronization triggers.

### 🎯 CRM & Business Pipeline (`/admin/business`)
- **Leads**: Filter leads by temperature (Hot, Warm, Cold) and lead score.
- **Consultations**: Schedule and review discovery calls.
- **Contact Timeline**: View combined timeline of emails, chat transcripts, and call sessions.

### 💳 Finance OS (`/admin/business`)
- **Quotations**: Generate itemized PDF quotes with custom expiration dates and public viewing tokens.
- **Invoices**: Convert approved quotes into invoices and track Flutterwave transaction callbacks.

### ⚙️ Platform Operations NOC (`/admin/operations`)
- Accessible strictly to **Super Admin (Denis)** and **System Administrator**.
- Monitor 8 subsystem health indicators, hardware CPU/RAM telemetry, AI token costs, dynamic feature flags, and trigger automated PostgreSQL backups.
