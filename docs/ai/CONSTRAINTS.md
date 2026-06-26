# AI Constraints & Guardrails

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Safety Guardrails

To prevent jailbreaks, prompt leakage, and resource waste, the following rules are hardcoded into the backend `guards.ts` and `response-validator.ts` layers:

### Input Security Check (`guards.ts`)
- **Prohibited Characters:** Block inputs containing excessive system prompt commands (e.g. `ignore previous instructions`, `system prompt:`, `developer mode`).
- **Rate Limits:** Enforce 60 messages per hour per IP.

### Response Safety Validation (`response-validator.ts`)
- **Leakage Filter:** Scan outgoing LLM tokens for string matches to internal developer prompts (e.g., "You are Denis Chamkaga's Assistant", instructions lists).
- **Pricing Override:** If the response contains pricing numbers without standard fallback warnings, automatically append:
  > "Please schedule a consultation with Denis to confirm official estimates."
- **Off-Topic Scanner:** If the response is generated outside the scope of Denis's portfolio (detected via intent mapping or keyword checking), overwrite the message with the standard redirect block.
