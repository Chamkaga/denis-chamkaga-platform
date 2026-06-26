# AI System Architecture & Integration Spec

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Core Architectural Principle

The AI Assistant is a specialized business assistant, **NOT** a general chatbot. Its sole responsibility is to guide visitors through Denis Chamkaga's portfolio, services, credentials, and business vision.

**Critical Guardrail:** The frontend must never communicate directly with Ollama. All interactions flow through the secure backend AI services.

---

## 2. Dedicated Backend AI Directory Structure

The backend AI pipeline is modularized into dedicated components:

```
backend/src/
├── ai/
│   ├── config/
│   │   └── ollama.ts             # Ollama client configuration
│   ├── prompt-builder.ts         # Assembles systems prompt and context
│   ├── knowledge-loader.ts       # Reads dynamic DB content (projects, services, etc.)
│   ├── conversation-manager.ts   # Core chatbot logic coordinator
│   ├── intent-classifier.ts      # Classifies messages into business intents
│   ├── lead-scoring.ts           # Grades leads (Cold, Warm, Hot, Investor, etc.)
│   ├── response-validator.ts     # Validates responses (guards against off-topic/leakage)
│   ├── tool-router.ts            # Dispatches action requests from prompt context
│   ├── memory.ts                 # Summarization and context state tracker
│   ├── session-manager.ts        # Tracks active/inactive session stores
│   ├── system-prompt.ts          # Default system instructions template
│   └── guards.ts                 # Input filtering and safety constraints
│
├── services/
│   ├── ollama.service.ts         # Handles low-level Ollama communication
│   ├── chat.service.ts           # Handles conversation transactions & caching
│   ├── lead.service.ts           # Saves leads, scores, and triggers notifications
│   └── recommendation.service.ts # Performs project/service matching based on intent
│
├── controllers/
│   └── chat.controller.ts        # HTTP controller for `/api/v1/ai/chat`
│
└── routes/
    └── chat.routes.ts            # Express router for AI chat endpoints
```

---

## 3. Ollama + Llama 3 Integration Pipeline

```
Ollama (Local Llama 3 Engine)
          ▲
          │
    ollama.service.ts
          ▲
          │
  conversation-manager.ts ◀─── guards.ts (Input safety)
          │
          ├──▶ prompt-builder.ts ◀─── system-prompt.ts & memory.ts
          ├──▶ knowledge-loader.ts (Queries dynamic DB tables)
          ├──▶ intent-classifier.ts
          │
          ▼
  response-validator.ts ◀─── (Filters off-topic / halts hallucination)
          │
          ├──▶ lead-scoring.ts (Updates session data & scores lead)
          └──▶ tool-router.ts (Triggers CRM / Handoff / Booking check)
          │
          ▼
    chat.controller.ts ──▶ Frontend Chat UI
```

---

## 4. Safety & Topic Restrictions

The AI is strictly blocked from discussing general topics (e.g., world history, sport, politics, general coding help outside of Denis's stack).

- **Off-topic Redirection:** If the input or response is flagged as off-topic by the `guards.ts` or `response-validator.ts`, the assistant must return the standard fallback redirection block.
- **Answer Guarantee:** The AI answers only from Denis's verified biography, portfolio, services, credentials, and future company vision. If information does not exist, the assistant replies:
  > "I don't currently have that information. Denis can provide further details during consultation."
