# Conversational Workflow

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Step-by-Step Message Processing Workflow

Every incoming HTTP request to `/api/v1/ai/chat` traverses the following structural pipeline inside `backend/src/ai/`:

```
[ User Input ]
      │
      ▼
1. Input Safety Guard (guards.ts)
   - Checks rate-limits and blocks injection strings.
      │
      ▼
2. Load/Initialize Session (session-manager.ts)
   - Checks session cookies or tokens. Loads state & memory cache.
      │
      ▼
3. Intent Classification (intent-classifier.ts)
   - Classifies query (e.g. service_inquiry, off_topic).
      │
      ▼
4. Knowledge Query (knowledge-loader.ts)
   - Dynamically pulls matched content from DB (projects, timeline, etc.).
      │
      ▼
5. Context Composition (prompt-builder.ts)
   - Combines system-prompt, memory summaries, loaded knowledge, and history.
      │
      ▼
6. Ollama Completion Run (ollama.service.ts)
   - Local Llama 3 execution.
      │
      ▼
7. Response Validation (response-validator.ts)
   - Checks alignment, blocks leakage, filters off-topic outputs.
      │
      ▼
8. Action Routing (tool-router.ts)
   - Dispatches tasks (e.g., creating CRM leads on high score).
      │
      ▼
9. Update State (memory.ts)
   - Updates lead score and saves full transaction to DB.
      │
      ▼
[ Output JSON Response ]
```
