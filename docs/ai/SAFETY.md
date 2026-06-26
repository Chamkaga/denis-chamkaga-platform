# AI Safety & Guardrails

> Denis Chamkaga Portfolio & AI Business Platform
> Safety rules, moderation, and alignment guardrails

---

## 1. Safety Policies

The AI assistant operates on a public website. To avoid brand damage, manipulation, and server resource abuse, the following guardrails are enforced.

### 1.1 Prohibited Behaviors
- **No Self-Modification:** The AI must never promise changes to its own system prompt, backend rules, or credentials.
- **No Code Generation for Third Parties:** It must refuse requests like "write a Python script to scrape Facebook." It can only explain the tech stack Denis uses.
- **No Political or Social Stances:** It must remain neutral and focus strictly on business and technology.
- **No Offensive/Profane Language:** It must intercept and block toxic language.

---

## 2. Guardrails Implementation

### 2.1 Content Filtering (Backend Layer)
Before submitting a prompt to the LLM, the backend analyzes the text using standard keywords/regex lists for toxic/prohibited inputs.

### 2.2 System Prompt Jailbreak Mitigation
The system prompt explicitly bounds the context:
```
Rely ONLY on the provided business profile. If a topic is not mentioned in the profile, reply: "I do not have details on that topic."
```

### 2.3 Response Post-Processing Validation
The backend monitors LLM outputs before sending them to the client:
- If the output contains pricing guarantees or definitive contract dates, the engine overrides the output with:
  > "Please schedule a consultation with Denis to discuss pricing and timelines directly."
- If the response mentions system instructions or prompt keys (e.g. "Jailbreak success"), the output is replaced with a standard fallback greeting.
