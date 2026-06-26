# Denis Chamkaga Portfolio & AI Business Platform

> Complete professional brand presence, AI digital assistant, CRM, and future business foundation (Terrasafi T Ltd).

---

## 1. Project Overview

This repository houses the entire **Denis Chamkaga Portfolio & AI Business Platform** — a highly tailored, production-grade system containing:
1. **Frontend Portfolio:** An interactive showcase built with React, Vite, TypeScript, Tailwind CSS, and Framer Motion.
2. **AI Business Assistant:** A contextual agent utilizing a local Ollama Llama 3 model (with cloud API fallbacks) that greets clients, collects requirements, scores leads, and routes notifications to Denis.
3. **Admin Panel:** A comprehensive, authenticated manager to manage projects, timeline entries, blogs, gallery items, leads, and analytics.
4. **Backend API:** An Express REST API interacting with a PostgreSQL database using Prisma ORM.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19, Vite, TypeScript
- **Styling:** Tailwind CSS (v4), Framer Motion
- **State Management:** Zustand (client state), TanStack Query (server state)
- **Forms & Validation:** React Hook Form, Zod
- **I18n:** i18next (English & Swahili)

### Backend
- **Runtime:** Node.js, Express, TypeScript
- **ORM:** Prisma ORM
- **Database:** PostgreSQL
- **Security:** JWT (Access & Refresh tokens), rate limiting, Helmet
- **AI Runtime:** Ollama (Llama 3 local engine)

---

## 3. Directory Structure

```
denis-chamkaga-platform/
├── docs/                         # Detailed architecture & modules documentation
│   ├── Architecture.md
│   ├── Requirements.md
│   ├── Goals.md
│   ├── Modules.md
│   ├── Pages.md
│   ├── Components.md
│   ├── Database.md
│   ├── API.md
│   ├── FolderStructure.md
│   ├── CodingStandards.md
│   ├── DevelopmentRoadmap.md
│   ├── ProjectStatus.md
│   └── ai/                       # AI system specs (Jailbreaks, Prompts, INTENTS)
│
├── frontend/                     # React application
│   ├── src/
│   │   ├── components/           # Atomic Design components (atoms/molecules/organisms)
│   │   ├── features/             # Feature slices (ai, admin, portfolio)
│   │   ├── pages/                # Route target views
│   │   └── services/             # API clients
│
├── backend/                      # Express backend API
│   ├── src/
│   │   ├── controllers/          # Request handlers
│   │   ├── services/             # Core business logic
│   │   ├── routes/               # API endpoints
│   │   └── ai/                   # AI runtime and intent classifiers
│
└── database/                     # Seeds and migrations
```

For the complete detailed file layout, please refer to the [Folder Structure Documentation](file:///docs/FolderStructure.md).

---

## 4. Development Setup

### Prerequisites
- Node.js (v22+ recommended)
- PostgreSQL running locally or in Docker
- Ollama (installed locally with the llama3.2/llama3 model downloaded)

### Configuration
1. Copy the environment template:
   ```bash
   cp .env.example .env
   ```
2. Open `.env` and fill in the database URL, JWT secrets, and mail server credentials.

### Installation
Install workspace dependencies:
```bash
# In root directory
npm install
```

### Running Locally
```bash
# Start backend in development mode
cd backend
npm run dev

# Start frontend in development mode
cd ../frontend
npm run dev
```

---

## 5. Documentation Map

Detailed guides are located in the `/docs` directory:
- **System Blueprint:** [Architecture Specification](file:///docs/Architecture.md)
- **Database Entity Schema:** [Database & Entity Design](file:///docs/Database.md)
- **Endpoint Manifest:** [API Contract Specification](file:///docs/API.md)
- **AI Brain Blueprint:** [AI Engine Specification](file:///docs/ai/AI_ARCHITECTURE.md)
- **Component Guidelines:** [Component Catalog](file:///docs/Components.md)
