# Support Contribution Architecture

```text
Enterprise Baseline Architecture

Version:
v1.0.0

Status:
Approved

Owner:
Denis Chamkaga Platform

Last Updated:
2026

Next Review:
Phase 3
```

---

## 1. Vision & Core Philosophy

The **Support Contribution Engine** is the backbone of the Denis Chamkaga Platform's relationship-building ecosystem. It abstracts the act of contributing to the platform into a multi-dimensional domain, moving beyond simple transactional logic:

*   **Payment is an Event, Not the Goal:** The primary objective of the engine is building long-term relationships with developers, sponsors, partners, and community members. Financial transactions are merely individual events in that relationship.
*   **Contribution is Multi-Dimensional:** Contributions are not products; they are presets. A contribution can represent:
    *   **Financial Resources** (Micro-donations, one-off payments, recurring sponsorships)
    *   **Time & Skills** (Code contributions, open-source pull requests, engineering audits)
    *   **Ideas & Research** (Documentation enhancements, algorithm designs, business models)
    *   **Partnerships & Mentorship** (Joint ventures, community coaching, student mentoring)

---

## 2. Core Platform Architecture

The Contribution Engine exists as a dedicated **Core Domain** service in the architecture, decoupled from specific view components or pages (such as `/support`).

```text
Core Platform
  ├── Public Website (Frontend Views)
  ├── Admin Console (Content Management & Dashboards)
  ├── AI Platform (Assistant Engines)
  ├── CRM (Customer & Supporter Profiles)
  ├── Contribution Engine (Core Domain logic)
  ├── Notification Center (Decoupled alerts bus)
  ├── Analytics (Funnel & sales metrics tracker)
  └── Integration Layer (External payment, email & SMS gateways)
```

By decoupling the engine into a core platform domain:
*   **Projects Domain** can trigger the Contribution Engine for *"Sponsor this Project"* campaigns.
*   **Blog Domain** can trigger it for *"Support this Article"* creator tips.
*   **Portfolio Domain** can trigger it for *"Fund this Research"* engineering campaigns.
*   **AI Domain** can trigger it for *"Support this AI Initiative"* resources.

---

## 3. Provider Layer (Abstraction Layer)

To prevent vendor lock-in and keep the core logic independent of external SDKs, all external services are abstracted behind unified **Providers**:

*   **PaymentProvider:** Defines interfaces for initiating sessions, verification, and refunds. Concrete drivers: DPO, Stripe, Selcom, Flutterwave.
*   **EmailProvider:** Defines interfaces for transactional emails. Concrete drivers: Mailgun, AWS SES, Resend.
*   **SmsProvider:** Defines interfaces for mobile notifications. Concrete drivers: Twilio, Beem SMS.
*   **StorageProvider:** Defines interfaces for receipt backups. Concrete drivers: AWS S3, local grid fs.
*   **AIProvider:** Defines interfaces for model prompt handling. Concrete drivers: OpenAI, Gemini, Claude.

Core domain services interact strictly with these abstract interfaces.

---

## 4. User Journey & Core Funnel Diagram

The journey channels visitors into distinct collaboration pathways, qualifying relationships at each phase:

```
                            [ Visitor Lands ]
                                    │
                                    ▼
                         [ Understands the Vision ]
                                    │
                                    ▼
                          [ How Can I Help? ]
                                    │
         ┌──────────────────────────┼──────────────────────────┐
         ▼                          ▼                          ▼
   [ Collaborate ]             [ Partner ]             [ Promote ]
 (Technical/Code)           (Strategic Joint)       (Advocacy/Social)
         │                          │                          │
         ▼                          ▼                          ▼
  CRM: Lead Scored           CRM: Partner Lead          Social Tracker
         │                          │                          │
         └──────────────────────────┼──────────────────────────┘
                                    │
                                    ▼
                        [ Support Financially ]
                                    │
                                    ▼
                        [ Choose Support Preset ]
                                    │
                                    ▼
                        [ Click Continue Securely ]
                                    │
                                    ▼
                         [ Initialize Session ]
                                    │
                                    ▼
                       [ Gateway Hosted Checkout ]
                                    │
                                    ▼
                         [ Server-Side Verify ]
                                    │
                                    ▼
                        [ CRM Supporter Status ]
                                    │
                                    ▼
                         [ Thank You Page / Feed ]
```

---

## 5. Contribution State Machine & Lifecycle

Every transaction progresses through a strictly monitored state lifecycle to support automated reconciliation and manual reviews:

```
      [ Draft ]           // Contribution initialized
          │
          ▼
     [ Pending ]          // Payment session generated
          │
          ▼
   [ Redirected ]         // User sent to hosted checkout
          │
      ┌───┴────────────────────────┬─────────────────────────┐
      ▼                            ▼                         ▼
   [ Paid ]                 [ Cancelled ]              [ Pending Review ]  // Manual workflow entry
      │                            │                         │
      ▼                            ▼                         ▼
  [ Verified ]              [ Expired ]                [ Approved ]
      │                                                      │
      ▼                                                      ▼
 [ Completed ]  ◄────────────────────────────────────────────┘
      │
      ├────────────────────────────┐
      ▼                            ▼
  [ Failed ]                  [ Refunded ] // Transaction reversed manually
```

---

## 6. Financial Ledger & Multi-Currency

### Accounting Ledger Path
To align platform activity with future accounting integrations, contributions are parsed directly into ledger entries:

```text
Contribution ──► Ledger Entry ──► Accounting Module ──► Reporting (Balance Sheet)
```

No data is treated purely as a floating payment. All completed items are mapped to dual-entry bookkeeping rules on the ledger.

### Database Schema (Prisma Schema Model)
The schema supports human-readable, consistent ID formatting and multi-currency exchange rate mapping:

```prisma
model SupportContribution {
  id             String    @id @default(uuid())
  ctrId          String    @unique                  // Human-readable ID (e.g. CTR-2026-000001)
  receiptNo      String?   @unique                  // Human-readable Receipt ID (e.g. RCP-2026-000001)
  type           String    @default("Financial")    // Financial, Collaboration, Partnership, Mentor, Volunteer, Research
  status         String    @default("Draft")        // Draft, Pending, Redirected, Paid, Verified, Completed, Cancelled, Failed, Expired, Refunded, PendingReview
  supporterName  String?
  supporterEmail String
  supporterPhone String?
  notes          String?   @db.Text                 // Supporter message or collaboration goals
  amount         Float?                             // Nullable for non-financial contributions
  currency       String?   @default("TZS")          // USD, TZS, KES, UGX, EUR, GBP
  exchangeRate   Float?    @default(1.0)            // Relative value vs base system currency (TZS)
  paymentMethod  String?                            // Mobile Money, Card, Bank, etc.
  reference      String?   @unique                  // Payment gateway tracking token
  createdAt      DateTime  @default(now())
  completedAt    DateTime?
}
```

### Identifier Naming Standards
To ensure indexing consistency across documents, the platform enforces these formats:
*   **Contribution ID:** `CTR-YYYY-NNNNNN` (e.g. `CTR-2026-000001`)
*   **Receipt ID:** `RCP-YYYY-NNNNNN` (e.g. `RCP-2026-000001`)
*   **Invoice ID:** `INV-YYYY-NNNNNN` (e.g. `INV-2026-000001`)
*   **Quotation ID:** `QTN-YYYY-NNNNNN` (e.g. `QTN-2026-000001`)

---

## 7. Decoupled Support Services

### Receipt Service
The receipt processing logic is decoupled from core routing:
1.  Listens for `ContributionCompleted` (containing a verified `CTR` code).
2.  Generates a corresponding `RCP` record.
3.  Assembles a PDF receipt.
4.  Uploads the file to the `StorageProvider`.
5.  Attaches the file reference to the CRM timeline.

### Notification Center
Arifa zote zinasimamiwa na kituo kimoja (Notification Center) kwa kutumia kiolesura cha pamoja cha kutuma ujumbe (Single Unified Interface) kwenda njia zifuatazo:
*   **Email:** Dispatched via `EmailProvider`.
*   **SMS:** Dispatched via `SmsProvider`.
*   **WhatsApp:** Integrates templates dynamically.
*   **Push Notifications:** Triggers browser and PWA push.
*   **In-app Notifications:** Feeds the CRM timeline and admin system tray.

---

## 8. Event Architecture (Event Bus Naming Standards)

State changes are dispatched as events to a central Event Bus. Other modules act as subscribers:

*   `ContributionCreated` - Fired when a transaction state is initialized as `Draft`.
*   `ContributionInitiated` - Fired when external payment session is active.
*   `ContributionCompleted` - Fired upon successful verification callback (triggers receipt generation and CRM update).
*   `ContributionCancelled` - Fired if callback reports user cancellation.
*   `ContributionFailed` - Fired if verification reports payment fail.
*   `ContributionRefunded` - Fired upon manual transaction refund.
*   `CollaboratorJoined` - Fired when a technical collaborator registers.
*   `PartnerRequested` - Fired when a business partnership form is submitted.
*   `VolunteerRegistered` - Fired when a community volunteer signs up.

---

## 9. Analytics Domain

The **Analytics Domain** tracks client metrics independently. The Support Funnel is simply a client of the unified Analytics Engine:

```
                            ┌───────────────────┐
                            │  Analytics Domain │
                            └─────────┬─────────┘
                                      │
         ┌───────────────┬────────────┴───┬───────────────┐
         ▼               ▼                ▼               ▼
  Support Funnel   CRM Funnel       Sales Funnel    AI Assistant Funnel
```

This prevents database locks and ensures analytical queries do not degrade transactional performance.

---

## 10. CRM & Relationship Timeline

Every supporter interaction is captured sequentially in their central CRM timeline to show customer journey progressions:

```text
Supporter Profile: John Doe (john@gmail.com)
  ├── 2026-07-21 00:01:00 : Viewed Support Page
  ├── 2026-07-21 00:03:15 : Clicked Partner CTA
  ├── 2026-07-21 00:04:30 : Submitted Partnership Proposal (PendingReview)
  ├── 2026-07-21 08:30:00 : Admin Approved Proposal (CRM status maps: Lead -> Partner)
  ├── 2026-07-21 10:00:00 : Meeting Scheduled (Timeline event)
  └── 2026-08-15 14:00:00 : Client Contract Initiated (Ambassador level achieved)
```

---

## 11. AI Integration (`ContributionAIService`)

The AI Assistant is integrated with the engine via the `ContributionAIService` interface:

*   **Intent Detection:** Analyzes chats to qualify how the user wants to contribute.
*   **Service Recommendation:** Matches user capabilities with active repository issues or partnership campaigns.
*   **Qualitative Scoring:** Scores the value of collaborator leads based on experience details.
*   **Automated Handoff:** Pre-populates Contribution forms and dispatches a qualified summary to the Admin Copilot.

---

## 12. Security & Compliance

*   **Zero Cardholder Data Storage:** The platform never processes, stores, or transmits credit card details or wallet PINs. It hands off sessions directly to the gateway hosted checkout.
*   **Verification Security:** Webhook and redirect callbacks are untrusted. The backend utilizes server-to-server validation via the `PaymentProvider` to confirm transaction status before completion.
