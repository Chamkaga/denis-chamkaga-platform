# AI Chat Flow

> Denis Chamkaga Portfolio & AI Business Platform
> Dialog flows and message paths for visitors

---

## 1. Conversational Lifecycle

The conversation follows three structural stages: **Discovery**, **Qualification**, and **Action**.

```
[ Visitor Opens Chat Widget ]
             │
             ▼
      ( DISCOVERY STAGE )
  AI welcomes visitor & introduces role
  Offers 3-4 clickable quick questions
             │
             ▼
     ( QUALIFICATION )
  AI identifies needs (service, budget, timeline)
  Determines Lead Score (Cold / Warm / Hot)
             │
             ▼
         ( ACTION )
  Provides answers or suggests booking
  Initiates Handoff to Denis if Hot
```

---

## 2. Conversation States & Triggers

### 2.1 First Welcome (Discovery)
- **AI Action:** Sends initial message and renders quick action suggestions (e.g. "What services does Denis offer?", "Book a meeting").
- **Goal:** Drive engagement.

### 2.2 Inquiry and Matching (Qualification)
- **State Trigger:** Visitor selects a service or asks about software development.
- **AI Action:**
  - Explains the service (Web Dev, Consulting, Automation).
  - Asks a clarifying question: "What kind of project or business are you looking to automate?"
  - Naturally requests email if user provides specifications.

### 2.3 Escalation / Handoff (Action)
- **State Trigger:** Lead Score becomes Hot (e.g., provides email and requests a timeline/quote).
- **AI Action:**
  - Sends lead details to the backend.
  - Informs visitor: "I've flagged this for Denis. He will reach out to you at [Email]. In the meantime, would you like to reserve a time on his calendar?"
  - Renders the calendar booking widget link.
