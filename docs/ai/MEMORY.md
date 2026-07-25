# AI Memory Management

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Domain-Scoped Enterprise Memory Registry

The memory engine (`memory.ts` and `session-manager.ts`) classifies extracted business intelligence into structured domain-specific parameters to mirror the mental profile of a professional consultant.

### 1.1 Memory Domains
* **Identity Domain:** Visitor Name, Company name, job position, verified email and phone.
* **Business Domain:** Projects budget, implementation timelines, stated custom development requirements, and industry vertical.
* **Relationship Domain:** Stated interest categories, objections or concerns raised, customer trust level, and preferred channel.
* **Conversation Domain:** Session histories, call duration, transcript outputs, and AI summaries.
* **Decision Domain:** Explicit commitments made, action items, next steps, and follow-up plan dates.

---

## 2. Hierarchical Memory Aggregation Scopes

When the LLM retrieves client memory facts, the system aggregates parameters across three nested scopes to resolve historical context:
1. **Session Scope:** Metadata facts collected dynamically during the active browser session.
2. **Visitor Scope:** Facts aggregated across historical chat sessions belonging to the same `visitorId`.
3. **Organization Scope:** Core business details linked via the PostgreSQL `Lead` relationship (such as official company titles and verified contact metrics).

*The merger prioritizes Organization parameters, then Visitor parameters, then Session parameters, ensuring verified CRM data overrides tentative chat inferences.*

---

## 3. Synchronization Pipeline

Memory sync occurs during two lifecycle moments:
1. **Periodic Session Sync:** As chat bubbles are exchanged, facts are extracted and persisted asynchronously to the `metadata` JSON field in `chat_sessions`.
2. **Human-Approved CRM Sync:** Upon voice call completion and Denis's approval of the CRM summary, `/admin/webrtc/crm-sync` merges the edited profile (needs, timelines, budgets, and challenges) back into `aiMemory` memory facts. This propagates these updates instantly to future conversations.
