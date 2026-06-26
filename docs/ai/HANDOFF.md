# AI Handoff Engine

> Denis Chamkaga Portfolio & AI Business Platform
> Orchestrating AI-to-Human Handover

---

## 1. Handoff Trigger Conditions

Handoff translates automated engagement into active business opportunities by transferring control or notifying Denis.

### Triggers
1. **Lead Score >= 61 (Hot Lead):** The visitor has shared contact information and project requirements.
2. **Explicit Handoff Request:** The user types messages like "I want to talk to Denis directly" or "Send this to Denis".
3. **Sentiment Degradation:** User displays frustration or repetitive circular loops (AI intent detection flags "complaint" or "low confidence" twice).
4. **Investor Inquiries:** Visitor explicitly asks about funding, investing, or equity in Terrasafi T Ltd.

---

## 2. Execution Flow

```
Visitor matches Trigger Condition
               │
               ▼
[ Handoff Engine Initiates Transaction ]
               │
               ├──────────────────────────────┐
               ▼                              ▼
     ( Client State Update )        ( Notification Dispatch )
  - Set session status to HANDOFF  - Compile chat transcript
  - Lock AI inputs in chat window  - Send email payload to Denis
  - Display confirmation to user   - Trigger webhook (future)
```

---

## 3. Email Notification Template

Sent immediately to Denis (`contact@denischamkaga.com`) when handoff triggers:

```
Subject: [HOT LEAD ALERT] New Consultation Inquiry via AI Assistant

Name: {leadName}
Email: {leadEmail}
Phone: {leadPhone}
Company: {leadCompany}
Lead Score: {leadScore} (HOT)

Estimated Budget: {leadBudget}
Estimated Timeline: {leadTimeline}

--- BRIEF CONVERSATION SUMMARY ---
{chatSummary}

--- FULL TRANSCRIPT LINK ---
https://denischamkaga.com/admin/leads/{leadId}
```
