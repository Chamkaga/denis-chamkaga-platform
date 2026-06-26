# AI Memory Management

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Session Memory Scope

The backend `memory.ts` and `session-manager.ts` manage state and context parameters across conversations.

### Tracked Metadata Fields
The assistant extracts and updates the following session metadata dynamically:
- **Visitor Name:** Extracted from text (e.g. "I am John from ABC Corp" → name: John, company: ABC Corp)
- **Language Preference:** `en` or `sw` (updated when user switches UI language or inputs Swahili)
- **Business/Industry:** User's business vertical (e.g., hospitality, logistics)
- **Budget Range:** Financial parameters stated by the user
- **Timeline:** Expected project launch date
- **Lead Score:** Derived numerical score (0-100)
- **Conversation Summary:** Periodic summaries of past messages (older than 10 messages)

---

## 2. Session Persistence Pipeline

1. **State Cached:** Session variables are stored in the backend cache to ensure low-latency completions.
2. **State Synced:** When the user sends a message or receives a reply, the state is persisted asynchronously to the PostgreSQL database (`chat_sessions` and `ai_conversations` tables).
3. **Context Truncation:** To respect LLM context length boundaries, the cache retains only the latest 10 messages as raw text. Older messages are compressed into a single dynamic context summary string.
