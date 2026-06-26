# AI Architecture

> Denis Chamkaga Portfolio & AI Business Platform
> Detailed AI System Architectural Blueprint

---

## 1. System Integration Flow

The AI system functions as an integrated pipeline that consumes user messages, interacts with local/cloud LLM providers, queries memory and knowledge bases, scores user engagement, and triggers transitions or notifications.

```mermaid
graph TD
    User([User Chat Input]) --> Controller[chatbot.controller.ts]
    Controller --> Service[ai.service.ts]
    Service --> SessionMgr[Session Manager]
    SessionMgr --> History[Load Chat History]
    Service --> IntentDetector[Intent Classifier]
    Service --> KB[Knowledge Base Query]
    
    KB --> LLM[LLM Provider Abstraction]
    History --> LLM
    IntentDetector --> LLM
    
    LLM --> ResponseGen[Response Post-Processing]
    ResponseGen --> LeadScore[Lead Scoring Engine]
    LeadScore --> Handoff[Handoff Engine]
    
    Handoff --> |Threshold Exceeded| Notifier[Email/SMS Notification]
    ResponseGen --> Controller
    Controller --> User
```

---

## 2. Component Blueprint

### 2.1 Chatbot Controller (`chatbot.controller.ts`)
- **Location:** `backend/src/controllers/chatbot.controller.ts`
- **Purpose:** Exposes the `/api/v1/ai/chat` endpoint, sanitizes user input, manages HTTP headers, and handles HTTP response mapping.
- **Rules:**
  - Standardizes the response with the `{ success, data: { sessionId, response, intent, confidence, suggestions, leadScore } }` envelope.
  - Implements route-level rate limiting using `rateLimiter.middleware.ts`.

### 2.2 AI Service (`ai.service.ts`)
- **Location:** `backend/src/services/ai.service.ts`
- **Purpose:** Coordinates the execution of intent detection, knowledge base queries, LLM prompting, lead scoring, and history tracking. It maintains the session token and maps session IDs to conversational streams.

### 2.3 LLM Provider Abstraction (`llm-provider.ts`)
- **Location:** `backend/src/ai/llm-provider.ts`
- **Purpose:** Defines the `LLMProvider` interface to decouple the business logic from specific LLM vendors (Ollama, OpenAI, Gemini, or Claude).
- **Implementation:** Handles provider timeouts, failovers, and tokens/usage monitoring.

---

## 3. Storage and Cache Model

Conversation states are stored in the database to support dashboard inspection, but active sessions are cached in-memory for low-latency retrieval.

### Active Sessions Cache (Redis or In-Memory Map)
- **Key:** `session:<sessionId>`
- **Value:** JSON object containing:
  - `messages`: Last N chat bubbles (minimized context).
  - `leadProfile`: Name, email, phone, company, and budget details extracted so far.
  - `intentHistory`: Array of detected intents to identify conversational loops.
  - `score`: Current numerical lead score.
- **TTL:** 24 hours of inactivity.

### Database Persistence (PostgreSQL via Prisma)
Active sessions write back to the database asynchronously on each message transaction:
- `chat_sessions`: Stores session identifiers, visitor metadata, overall lead score, status, and timestamps.
- `ai_conversations`: Stores each individual prompt and response, token counts, processing latency, and intent classifications.
