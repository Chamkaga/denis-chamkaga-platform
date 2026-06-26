# AI Lead Scoring Engine

> Denis Chamkaga Portfolio & AI Business Platform
> Formula, parameters, and grading model for user engagement scoring

---

## 1. Score Calculation Formula

The Lead Scoring Engine parses user inputs during active chat sessions and assigns points based on intent triggers and extracted fields.

```
Total Score = S(Contact) + S(Project) + S(Engagement) + S(Intent)
```

Where:
- **Max Score:** 100
- **Threshold for Warm:** 31
- **Threshold for Hot:** 61

---

## 2. Scoring Parameter Breakdown

### 2.1 Contact Fields (Max 35 pts)
Points are added when the visitor shares contact details:
- **Valid Email:** +20 points (Zod validation check)
- **Phone Number:** +15 points

### 2.2 Project Context Fields (Max 45 pts)
Points are added when project attributes are defined:
- **Budget Range Mentioned:** +20 points (e.g. mentions "price", "budget", "cost", "how much")
- **Timeline Stated:** +15 points (e.g. "next month", "ASAP", "by December")
- **Company / Business Name Provided:** +10 points

### 2.3 Engagement Signals (Max 20 pts)
Points are added for deep interactions:
- **Extended Dialogue (5+ message exchanges):** +5 points
- **Explicit Booking / Appointment Request:** +15 points

---

## 3. Classification and Actions

| Score | Grade | Action |
|-------|-------|--------|
| **0 - 30** | Cold | Store session as anonymous log; no notifications sent. |
| **31 - 60** | Warm | Flag lead in CRM. Include conversation transcript. |
| **61 - 100** | Hot | Immediately escalate lead. Send email notification to Denis. Renders calendar CTA. |
