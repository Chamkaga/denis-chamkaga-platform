# Engineering Handbook

> Denis Chamkaga Platform · Enterprise Engineering Guidelines · Version v1.0.0

---

## 1. Coding Standards

### Language & Runtimes
*   **Backend:** Node.js v22 LTS + Express.js v5 + TypeScript (Strict Mode).
*   **Frontend:** React v19 + TypeScript (Strict Mode) + Vite v8.
*   **Styling:** Vanilla CSS + custom design tokens. Tailwind CSS where explicitly requested.
*   **Database:** Prisma ORM v6.x (targeting PostgreSQL v16).

### Code Quality Rules
*   **No Explicit Any:** Avoid the `any` type at all costs. Utilize `unknown` or specify explicit TypeScript types/interfaces.
*   **Named Exports:** Do not use default exports. Export components and services explicitly by name:
    ```typescript
    export const AuthService = { ... };
    ```
*   **Null / Undefined checks:** Enable strict null checks in `tsconfig.json`.

---

## 2. Folder Structure Standards

The project follows a monorepo structure. Files are organized by feature domains rather than technical type to increase modularity.

```text
denis-chamkaga-platform/
├── backend/
│   ├── src/
│   │   ├── core/           # Core platform modules (EventBus, ErrorHandler)
│   │   ├── domains/        # Feature domains (Auth, CRM, Contribution)
│   │   ├── providers/      # Abstract service providers interfaces
│   │   ├── integrations/   # Concrete service drivers (DPO, Mailgun)
│   │   └── server.ts       # Express bootstrap
│   └── prisma/
│       └── schema.prisma   # Single source of truth database model
├── frontend/
│   ├── src/
│   │   ├── components/     # Atomic UI atoms, molecules, organisms
│   │   ├── config/         # Routing and translation configs
│   │   ├── store/          # Zustand global state managers
│   │   └── pages/          # Layout views
```

---

## 3. Naming Conventions

### File Naming
*   **React Components:** PascalCase component file, nested within a matching directory name (e.g. `Button/Button.tsx`).
*   **Hooks:** camelCase with `use` prefix (e.g. `useThemeScroll.ts`).
*   **Controllers/Routes/Services:** camelCase with matching suffixes (e.g. `auth.controller.ts`, `auth.routes.ts`, `auth.service.ts`).

### Human-Readable Identifier Formats
All business and transactional records must map to unified human-readable formats for receipts, invoices, quotations, and database tracking:

| Document Type | Prefix | Format Standard | Example |
|:---|:---|:---|:---|
| **Contribution** | `CTR` | `CTR-YYYY-NNNNNN` | `CTR-2026-000001` |
| **Receipt** | `RCP` | `RCP-YYYY-NNNNNN` | `RCP-2026-000001` |
| **Invoice** | `INV` | `INV-YYYY-NNNNNN` | `INV-2026-000001` |
| **Quotation** | `QTN` | `QTN-YYYY-NNNNNN` | `QTN-2026-000001` |

---

## 4. API Response & Error Standards

To establish predictability, all endpoints must adhere to a single JSON response structure.

### Successful Response Format (2xx)
```json
{
  "success": true,
  "data": {
    "clientId": "cuid-123456",
    "name": "Jane Doe"
  }
}
```

### Error Response Format (4xx / 5xx)
Every error response must provide a unique code prefix matching its domain layer:

```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Invalid credentials provided.",
    "details": {
      "field": "password",
      "reason": "Password length must be at least 8 characters"
    }
  }
}
```

#### Standard Error Code Prefixes:
*   `AUTH_xxx` - Authentication and role authorization failures.
*   `DB_xxx` - Database connection or query constraints.
*   `GATEWAY_xxx` - External payment / communication integration failures.
*   `VAL_xxx` - Payload syntax validation errors (e.g. Zod failures).

---

## 5. Event Bus & Messaging Standards

State adjustments and actions are dispatched through the central Event Bus. Event names follow a strict `NounPastVerb` pattern:

| Domain | Event Dispatched | Trigger Condition |
|:---|:---|:---|
| **Auth** | `UserCreated` | A new administrator is added.
| **CRM** | `LeadCreated` | An incoming lead is registered.
| **CRM** | `LeadQualified` | A lead profile score changes.
| **Contribution** | `ContributionInitiated` | A new payment checkout session is created.
| **Contribution** | `ContributionCompleted` | Transaction verification succeeds.
| **Invoicing** | `InvoiceCreated` | A new billing invoice is saved.
| **Notifications** | `NotificationSent` | A SMS, WhatsApp, or email is dispatched.

---

## 6. Database Standards

*   **Soft Delete:** Data is rarely deleted physically. Models must use a nullable `deletedAt` field. Queries filter where `deletedAt == null` to preserve historic records.
*   **Primary Keys:** Primary keys default to CUID format (`cuid()`). Do not mix UUID formats across entities.
*   **Indexing:** Build indices on frequently queried lookup keys, such as `slug`, `email`, and `status`.
*   **Universal Status Standards:** Avoid ad-hoc status strings. Constrain states to the following global lifecycle values:
    *   `Draft` - Uncommitted template or record.
    *   `Pending` - Awaiting external callback or manual check.
    *   `Active` - Functional and verified (e.g. users, systems).
    *   `Completed` - Finished and reconciled.
    *   `Cancelled` - Terminated by client or system.
    *   `Archived` - Deprecated but preserved.
    *   `Deleted` - Flagged for soft delete exclusion.

---

## 7. UI & Styling Standards

*   **Atomic Design:** Keep widgets modular. Components belong to Atoms (buttons, inputs), Molecules (form groups), or Organisms (navbars, card grids).
*   **Design Tokens:** Reference the root tokens defined in [index.css](file:///d:/Projects/denis-chamkaga-platform/frontend/src/index.css#L6-L18). Ad-hoc hex colors inside React styles are prohibited.
*   **Smooth Motion:** Transitions utilize standard micro-animations (`framer-motion`) and ease transitions:
    ```css
    transition-duration: 250ms;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    ```

---

## 8. Git Workflow & Commit Conventions

### Branch Strategy
We follow a modified Gitflow process:
*   `main` - Production candidate builds.
*   `develop` - Integration branch for active developer sprints.
*   `feature/` - Prefix for new modules (e.g., `feature/admin-auth`).
*   `bugfix/` - Prefix for patch fixes (e.g., `bugfix/dpo-callback`).

### Commit Messages Format
Commit logs must use descriptive, lowercase prefixes:
*   `feat: add DPO invoice payment redirect hooks`
*   `fix: resolve memory leak in WebRTC session listener`
*   `docs: update engineering manual for event bus`
*   `refactor: optimize DB client connection pool`

---

## 9. Definition of Done (DoD)

A task cannot be marked as complete, nor a PR merged, unless it meets the following Definition of Done criteria:

1.  **Code Compilation:** `npm run build` runs and compiles with zero warnings or errors.
2.  **Linting Verification:** `npm run lint` passes without stylistic violations.
3.  **Unit Tests:** Local unit tests run and pass successfully.
4.  **Documentation:** Relevant architectural or API markdown specifications are updated.
5.  **Audit Logs:** Database operations write trace logs to `AuditLog`.
6.  **Analytics:** Actions are hooked to the central Analytics domain tracker.
7.  **Internationalization:** Swahili (`sw.json`) and English (`en.json`) localization strings are complete.
