# OpenAI-only AI runtime

The platform's supported AI runtime provider is **OpenAI only**.

- Mary, Admin Copilot, generation, streaming, extraction, and embeddings must use backend-held OpenAI credentials.
- The frontend must never receive or call with an OpenAI API key.
- `AI_PROVIDER` and `ACTIVE_AI_PROVIDER` must resolve to `openai`. Any other configured value is a startup/runtime configuration error.
- A failed OpenAI request enters the controlled, clearly labelled degraded mode. It must not silently switch to Ollama, Llama, Gemini, or another model provider.
- Retrieval and deterministic business-rule fallbacks may continue serving verified platform knowledge, but telemetry must label them as fallback rather than successful LLM generation.
- Provider interfaces may remain as abstraction boundaries for maintainability, but no alternate provider is part of the approved runtime architecture.

## Customer call contract

When a visitor chooses the web-call action, the visitor's authorized conversation capability scopes the WebRTC offer and signaling operations. The authenticated Admin/Owner console polls the protected incoming-offer endpoint. An incoming call must be visible in the console call overlay and on the Owner dashboard's Customer Call Desk, with explicit **Accept Call** and **Decline** actions. Completion or rejection is recorded through an authenticated call-log request; internal notes remain inaccessible to visitors.
