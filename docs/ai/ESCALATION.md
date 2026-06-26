# Lead Escalation & Handoff Rules

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Action Routing Thresholds

The escalation engine monitors the calculated Lead Score to trigger human handoff.

```
Visitor Chat Input
       │
       ▼
[ Lead Scoring Engine ]
       │
       ├────── Score >= 61 (Hot Lead) ──▶ [ Trigger Handoff ]
       │                                         │
       │                                         ├── Sync session logs to DB
       │                                         ├── Dispatch email to Denis
       │                                         └── Render CTA: "Denis has received..."
       │
       └────── Score < 61 (Warm/Cold) ──▶ [ Maintain Chat Loop ]
```

---

## 2. Notification Dispatch

Upon handoff validation, the backend `lead.service.ts` executes the following sequence:
1. **Lead Insertion:** Write client contact and requirements into the PostgreSQL `leads` table.
2. **Conversation Digest:** Aggregate full transcript logs into a structured summary block.
3. **Notification Mail:** Use the configured mail system to send a prioritized email to Denis (`contact@denischamkaga.com`) containing the full transcript link and lead profile.
4. **UI Update:** The response payload instructs the client frontend to display:
   > "Denis has received your request and will contact you soon."
   And automatically shows the calendar booking integration widget link.
