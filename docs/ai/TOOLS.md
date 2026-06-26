# AI Tool Execution & Actions

> Denis Chamkaga Portfolio & AI Business Platform
> Action Mapping for the Conversational Assistant

---

## 1. Concept of Tool Execution

To make the AI interactive, the backend conversation engine can trigger internal actions ("tools") based on intent detection. The LLM does not execute external code directly; instead, it outputs structured markers in its response (or via function calling models) that the backend service translates into system commands.

---

## 2. Supported Tools

### 2.1 Project Retrieval (`get_projects_by_tag`)
- **Purpose:** Searches the portfolio for projects matching specific tags or categories.
- **Trigger:** "Show me your web apps", "Do you have any PHP work?"
- **Backend Execution:** Invokes the `projectService.getAll({ category: tag })` method.
- **Output:** Returns a summarized JSON array of matching projects, formatted as inline links: `[Project Title](file:///projects/slug)`.

### 2.2 Service Details Lookup (`get_service_info`)
- **Purpose:** Fetches structural details, pricing tiers, and delivery models for a specific service.
- **Trigger:** "How do you build databases?", "What's included in business consultation?"
- **Backend Execution:** Reads service details from memory or database.
- **Output:** Returns benefits, scope, and CTA suggestions.

### 2.3 Lead Creation Handshake (`submit_lead`)
- **Purpose:** Automatically transfers client details (name, email, requirements, budget) captured in the chat into the CRM table.
- **Trigger:** User shares email and requirements.
- **Backend Execution:** Creates an entry in the `leads` table and tags it as `source: AI_Assistant`.
- **Output:** Returns status `success` and triggers the email/SMS handoff notifier.

### 2.4 Appointment Booking Check (`check_calendar_availability`)
- **Purpose:** Retrieves available time blocks for Denis's consultations.
- **Trigger:** "Can I book a meeting for Monday?"
- **Backend Execution:** Queries the database or local calendar interface for available hours.
- **Output:** Suggests open times to the chat interface.
