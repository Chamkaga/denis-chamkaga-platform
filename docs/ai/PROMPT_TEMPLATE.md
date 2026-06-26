# Prompt Construction Templates

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Dynamic Prompt Construction Template

This represents the structured payload sent to the local Ollama Llama 3 engine by the backend `prompt-builder.ts`:

```markdown
[SYSTEM INSTRUCTION]
{system_prompt_rules}

[DYNAMIC KNOWLEDGE BASE]
Below is the matched context retrieved from Denis's database settings, projects, services, or biography:
---
{database_knowledge_context}
---

[VISITOR PROFILE MEMORY]
- Visitor Name: {visitor_name}
- Stated Company: {visitor_company}
- Target Budget: {visitor_budget}
- Target Timeline: {visitor_timeline}
- Calculated Lead Score: {lead_score}
- Language: {current_language}

[CONVERSATION HISTORY SUMMARY]
{chat_history_summary}

[ACTIVE DIALOGUE WINDOW]
{last_10_chat_messages}

[ASSISTANT RESPONSE BOUND]
Answer the user's latest query directly, following all constraints. Keep the response under 150 words.
```
