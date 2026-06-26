# AI Conversation History & Session State

> Denis Chamkaga Portfolio & AI Business Platform
> Session Lifecycle & State Management Rules

---

## 1. Session Lifecycle

Every conversation starts with a session initialization. Sessions track state across active tabs and page transitions.

```
                  [ Visitor lands on Site ]
                             │
                             ▼
                 [ Generate Session Token ]
                 UUID/cuid saved in cookies
                             │
                             ▼
                [ First Chat widget click ]
             Load empty session history from DB
                             │
                             ▼
                [ Messages Exchanged (1..N) ]
               Cache state, update database
                             │
                             ▼
               [ Closing / Inactivity Timeout ]
            Save final summary, flush cache block
```

---

## 2. Session Context Schema

The state database maintains the following JSON representation for an active chat session:

```typescript
interface ChatSessionState {
  sessionId: string;
  visitorIp: string;
  language: 'en' | 'sw';
  leadScore: number;
  extractedMetadata: {
    name?: string;
    email?: string;
    phone?: string;
    company?: string;
    budget?: string;
    timeline?: string;
  };
  messages: Array<{
    id: string;
    sender: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    intent?: string;
  }>;
  status: 'active' | 'handoff' | 'closed';
}
```

---

## 3. History Truncation and Summarization

To prevent LLM token overflow on long conversations:
- **Active Context Window:** Only the last 10 messages are passed as raw conversational bubbles in the prompt.
- **Context Summarization:** Older messages (11+) are periodically summarized by a quick background LLM pass into a 3-line summary: `Context: User is a business owner looking for a CRM solution with a $2,000 budget. Already asked about database experience.`
- The summary is appended to the system prompt context.
