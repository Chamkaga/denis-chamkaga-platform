# Intent Classification Guide

> Denis Chamkaga Portfolio & AI Business Platform
> Catalog of conversational intents and classification rules

---

## 1. Intent Catalog

The Intent Classifier parses incoming messages to route them to the correct business logic.

| Intent | Description | Sample Queries | Routing Action |
|--------|-------------|----------------|----------------|
| `greeting` | Welcoming interaction | "hello", "mambo", "hi" | Welcome response, quick questions |
| `about_denis` | Bio and background requests | "Who is Denis?", "where did you study?" | Explains career path, UDCC, Securex, PCCI |
| `service_inquiry` | Requests for services | "can you build a website?", "what consulting do you do?" | Returns details of specific services |
| `project_inquiry` | Requests to see portfolio | "show me your projects", "have you built databases?" | Returns matching project list |
| `pricing_inquiry` | Pricing or cost questions | "how much is a website?", "what are your rates?" | Explains baseline tiers, asks for budget |
| `booking_request` | Scheduling a consultation | "can we meet?", "let's book a call" | Presents calendar booking widget link |
| `contact_request` | Requests for phone/email | "what is your email?", "how do I contact you?" | Shows email and phone details |
| `investor_inquiry` | Funding or equity interest | "I want to invest in Terrasafi", "are you raising seed capital?" | Tags lead as Investor, initiates handoff |
| `off_topic` | Unrelated questions | "write code for scraping", "what is the capital of France?" | Politely redirects to portfolio topics |

---

## 2. Dynamic Routing Logic

Intents guide the contextual recommendations offered by the chat window. If the detected intent is `service_inquiry` with category "Web Development", the AI includes the matching `ProjectCard` recommendations in the response payload.
