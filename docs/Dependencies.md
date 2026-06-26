# Dependencies

> Denis Chamkaga Portfolio & AI Business Platform
> Complete Dependency Inventory

---

## Frontend Dependencies

### Production Dependencies

| Package | Version | Purpose | Required By |
|---------|---------|---------|-------------|
| react | ^19.2.7 | UI framework | Core |
| react-dom | ^19.2.7 | DOM rendering | Core |
| react-router-dom | ^7.x | Client-side routing | Phase 8 |
| @tanstack/react-query | ^5.x | Server state management | Phase 8 |
| zustand | ^5.x | Client state management | Phase 8 |
| react-hook-form | ^7.x | Form handling | Phase 8 |
| @hookform/resolvers | ^3.x | Form validation resolvers | Phase 8 |
| zod | ^3.x | Schema validation | Phase 8 |
| framer-motion | ^11.x | Animations and transitions | Phase 8 |
| react-i18next | ^15.x | Internationalization | Phase 8 |
| i18next | ^24.x | i18n core | Phase 8 |
| react-helmet-async | ^2.x | SEO meta tags | Phase 8 |
| lucide-react | ^0.x | Icon library | Phase 8 |
| clsx | ^2.x | Conditional CSS classes | Phase 8 |
| tailwind-merge | ^2.x | Tailwind class merging | Phase 8 |

### Development Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| typescript | ~6.0.2 | Type checking (already installed) |
| vite | ^8.1.0 | Build tool (already installed) |
| @vitejs/plugin-react | ^6.0.2 | React plugin (already installed) |
| tailwindcss | ^4.x | CSS framework |
| @tailwindcss/vite | ^4.x | Tailwind Vite plugin |
| eslint | ^10.5.0 | Linting (already installed) |
| eslint-plugin-react-hooks | ^7.1.1 | React hooks rules (already installed) |
| vitest | ^3.x | Unit testing |
| @testing-library/react | ^16.x | Component testing |
| @testing-library/jest-dom | ^6.x | DOM matchers |
| @types/react | ^19.2.17 | React types (already installed) |
| @types/react-dom | ^19.2.3 | React DOM types (already installed) |

---

## Backend Dependencies

### Production Dependencies

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| express | ^5.2.1 | HTTP framework | ✅ Installed |
| cors | ^2.8.6 | CORS middleware | ✅ Installed |
| bcrypt | ^6.0.0 | Password hashing | ✅ Installed |
| jsonwebtoken | ^9.0.3 | JWT authentication | ✅ Installed |
| dotenv | ^17.4.2 | Environment variables | ✅ Installed |
| @prisma/client | ^6.x | Database ORM client | ❌ To install |
| zod | ^3.x | Request validation | ❌ To install |
| helmet | ^8.x | Security headers | ❌ To install |
| express-rate-limit | ^7.x | Rate limiting | ❌ To install |
| winston | ^3.x | Logging | ❌ To install |
| multer | ^2.x | File uploads | ❌ To install |
| slugify | ^1.x | URL slug generation | ❌ To install |
| nodemailer | ^6.x | Email sending | ❌ To install |

### Development Dependencies

| Package | Version | Purpose | Status |
|---------|---------|---------|--------|
| typescript | ^5.x | Type checking | ❌ To install |
| tsx | ^4.x | TypeScript execution | ❌ To install |
| @types/express | ^5.x | Express types | ❌ To install |
| @types/cors | ^2.x | CORS types | ❌ To install |
| @types/bcrypt | ^5.x | bcrypt types | ❌ To install |
| @types/jsonwebtoken | ^9.x | JWT types | ❌ To install |
| @types/multer | ^1.x | Multer types | ❌ To install |
| @types/nodemailer | ^6.x | Nodemailer types | ❌ To install |
| prisma | ^6.x | Prisma CLI | ❌ To install |
| jest | ^30.x | Testing framework | ❌ To install |
| @types/jest | ^30.x | Jest types | ❌ To install |
| ts-jest | ^30.x | TypeScript Jest | ❌ To install |
| nodemon | ^3.x | Dev server auto-restart | ❌ To install |

---

## Infrastructure Dependencies

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22.x LTS | Runtime |
| PostgreSQL | 16.x | Database |
| Docker | 27.x | Containerization |
| Docker Compose | 2.x | Multi-service orchestration |
| NGINX | 1.27.x | Reverse proxy |
| Ollama | Latest | Local LLM runtime |
| Git | 2.x | Version control |

---

## Dependency Rules

1. **Pin major versions** — Use `^` for minor/patch updates, never `*`
2. **No duplicate dependencies** — Frontend and backend share `zod` but maintain separate installs
3. **Audit weekly** — Run `npm audit` in both frontend and backend
4. **Update monthly** — Review and update dependencies monthly
5. **No unnecessary dependencies** — Every package must have a documented purpose
6. **Prefer well-maintained packages** — Check GitHub activity, download counts, security advisories
7. **No deprecated packages** — Replace any deprecated dependencies immediately
