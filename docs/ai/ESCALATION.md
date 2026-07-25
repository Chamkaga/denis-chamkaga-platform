# Lead Escalation & Handoff Rules

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Action Routing & Qualification Thresholds

The escalation engine monitors the calculated Lead Score and conversation metrics to trigger both passive handoffs (CTAs/links) and active handoffs (Voice Calling).

```
Visitor Chat Input
       │
       ▼
[ Lead Scoring Engine ]
       │
       ├────── Score >= 50 or "Warm/Hot" ──────▶ [ Enable Calling Gating ]
       │                                                │
       │                                                ├── Pre-Call Customer Brief Compile
       │                                                └── Call Button active in Widget
       │
       └────── Score < 50 (Unqualified)   ──────▶ [ Restrict Calling Gating ]
                                                        │
                                                        └── CTA: Chat with Assistant
```

### 1.1 Qualification Parameters
The AI chatbot must collect or infer key qualification properties before initiating escalation:
* **Customer Profile:** Name, company, role, country.
* **Project Parameters:** Requested service, budget estimation, implementation timeline.
* **Engagement Indicators:** Urgency, sentiment, chat duration, numerical lead score, lead temperature.

---

## 2. Voice Handoff Signaling Workflow

Once the visitor clicks "Call Denis", the WebRTC signaling workflow executes:
1. **Gating Check:** The backend `/ai/webrtc/session` route checks if the active session ID has a lead score $\ge 50$. If not, the request is rejected with a `403 Forbidden` error.
2. **Offer Registration:** The browser sends an SDP Offer to `/ai/webrtc/offer`. The backend registers this offer and asynchronously triggers LLM compilation of a structured **Customer Brief**.
3. **Incoming Admin Dashboard:** Denis's admin portal retrieves the offer (including the Customer Brief). The incoming popup displays the customer's profile, budgets, timeline guidelines, pain points, sales approaches, and suggested opening lines.
4. **Active Call Notes:** During the call, Denis types rough call notes in the ongoing connection card.
5. **Post-Call Review:** Upon hanging up, the system enters a `summary_pending` state. Denis clicks **"Generate CRM Summary"** to request a consolidated LLM report.
6. **Approval & Synchronization:** Denis reviews and edits the report fields directly inside the overlay. Clicking **"Approve & Sync to CRM"** calls `/admin/webrtc/crm-sync`, committing the files, updating AI memory facts, writing timeline events, and creating follow-up task notifications.

---

## 3. Passive Handoff Notifications

For visitors who qualify but do not call, passive handoffs remain active:
1. **Lead Insertion:** Write client contact and requirements into the PostgreSQL `leads` table.
2. **Conversation Digest:** Aggregate full transcript logs into a structured summary block.
3. **Notification Mail:** Send a prioritized email containing the transcript link and lead profile to Denis (`contact@denischamkaga.com`).
4. **Calendar Integration:** Instruct the client frontend to display the calendar booking widget.
