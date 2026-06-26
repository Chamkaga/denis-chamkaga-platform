# Folder Structure

> Denis Chamkaga Portfolio & AI Business Platform
> Target Production Structure

---

## Complete Project Structure

```
denis-chamkaga-platform/
│
├── .env                          # Environment variables (git-ignored)
├── .env.example                  # Environment template (committed)
├── .gitignore                    # Git ignore rules
├── docker-compose.yml            # Docker multi-service config
├── package.json                  # Root workspace package.json
├── README.md                     # Project overview and setup guide
│
├── docs/                         # Project documentation
│   ├── Architecture.md
│   ├── Requirements.md
│   ├── Goals.md
│   ├── Modules.md
│   ├── Pages.md
│   ├── Components.md
│   ├── Database.md
│   ├── API.md
│   ├── Authentication.md
│   ├── Admin.md
│   ├── AI.md
│   ├── Deployment.md
│   ├── FolderStructure.md
│   ├── ImageAssetManagement.md
│   ├── CodingStandards.md
│   ├── DevelopmentRoadmap.md
│   ├── ProjectStatus.md
│   ├── FutureFeatures.md
│   ├── Risks.md
│   ├── Dependencies.md
│   ├── Testing.md
│   ├── ChangeLog.md
│   │
│   └── ai/                       # AI-specific documentation
│       ├── AI_RULES.md
│       ├── AI_ARCHITECTURE.md
│       ├── AI_BEHAVIOR.md
│       ├── PROMPTS.md
│       ├── TOOLS.md
│       ├── KNOWLEDGE.md
│       ├── SAFETY.md
│       ├── CHAT_FLOW.md
│       ├── LEAD_SCORING.md
│       ├── HANDOFF.md
│       ├── INTENTS.md
│       └── CONVERSATION.md
│
├── frontend/                     # React + Vite Frontend
│   ├── index.html                # HTML entry point
│   ├── package.json              # Frontend dependencies
│   ├── tsconfig.json             # TypeScript root config
│   ├── tsconfig.app.json         # App TypeScript config
│   ├── tsconfig.node.json        # Node TypeScript config
│   ├── vite.config.ts            # Vite configuration
│   ├── tailwind.config.ts        # Tailwind CSS configuration
│   ├── eslint.config.js          # ESLint configuration
│   ├── Dockerfile                # Frontend Docker build
│   │
│   ├── public/                   # Static public assets
│   │   ├── favicon.svg           # DC branded favicon
│   │   ├── robots.txt            # SEO robots file
│   │   ├── sitemap.xml           # SEO sitemap
│   │   └── images/               # Centralized Image Library
│   │       ├── hero/             # Hero portrait and mockup visuals
│   │       ├── about/            # About portraits and work philosophies
│   │       ├── timeline/         # Company logos and milestone graphics
│   │       ├── services/         # Service card visual illustrations
│   │       ├── projects/         # Project previews and case study graphics
│   │       ├── gallery/          # Masonry grid gallery pictures
│   │       ├── certificates/     # Certificates and diplomas graphics
│   │       ├── assistant/        # Denis Assistant workflow diagrams
│   │       ├── future/           # Terrasafi lab and innovation concept maps
│   │       ├── backgrounds/      # Dark/light ambient blur glow WebP layers
│   │       ├── icons/            # Customized visual icon stubs
│   │       ├── testimonials/     # Testimonials reviews graphics
│   │       ├── partners/         # Business partner logos
│   │       └── placeholders/     # Temporary fallback graphics
│   │
│   └── src/                      # Frontend source code
│       ├── main.tsx              # React entry point
│       ├── App.tsx               # Root application component
│       ├── index.css             # Global styles + Tailwind imports
│       ├── vite-env.d.ts         # Vite type declarations
│       │
│       ├── assets/               # Imported assets (bundled)
│       │   ├── icons/            # SVG icon components
│       │   ├── images/           # Images imported in code
│       │   └── fonts/            # Custom fonts (if any)
│       │
│       ├── components/           # Shared UI components
│       │   ├── atoms/            # Smallest reusable elements
│       │   │   ├── Button/
│       │   │   ├── Input/
│       │   │   ├── Badge/
│       │   │   ├── Avatar/
│       │   │   ├── Icon/
│       │   │   ├── Logo/
│       │   │   ├── Spinner/
│       │   │   ├── Skeleton/
│       │   │   ├── Tag/
│       │   │   ├── Tooltip/
│       │   │   ├── Divider/
│       │   │   └── Text/
│       │   │
│       │   ├── molecules/        # Atom combinations
│       │   │   ├── Card/
│       │   │   ├── SearchBar/
│       │   │   ├── NavLink/
│       │   │   ├── FormField/
│       │   │   ├── StatCard/
│       │   │   ├── SocialLinks/
│       │   │   ├── ThemeToggle/
│       │   │   ├── LanguageSwitcher/
│       │   │   ├── RatingStars/
│       │   │   ├── Breadcrumb/
│       │   │   ├── Pagination/
│       │   │   ├── EmptyState/
│       │   │   └── ErrorMessage/
│       │   │
│       │   ├── organisms/        # Complex UI sections
│       │   │   ├── Navbar/
│       │   │   ├── Footer/
│       │   │   ├── Hero/
│       │   │   ├── ProjectCard/
│       │   │   ├── ServiceCard/
│       │   │   ├── TestimonialCard/
│       │   │   ├── TimelineEntry/
│       │   │   ├── CertificateCard/
│       │   │   ├── GalleryGrid/
│       │   │   ├── BlogPostCard/
│       │   │   ├── ContactForm/
│       │   │   ├── ChatWidget/
│       │   │   ├── ChatMessage/
│       │   │   ├── SectionHeader/
│       │   │   └── StatsGrid/
│       │   │
│       │   └── templates/        # Page layout wrappers
│       │       ├── PublicLayout/
│       │       ├── AdminLayout/
│       │       ├── AuthLayout/
│       │       └── SectionLayout/
│       │
│       ├── features/             # Feature-specific logic
│       │   ├── ai/               # AI chat feature
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   ├── services/
│       │   │   └── types.ts
│       │   │
│       │   ├── admin/            # Admin feature
│       │   │   ├── components/
│       │   │   ├── hooks/
│       │   │   └── pages/
│       │   │
│       │   └── portfolio/        # Portfolio feature
│       │       ├── components/
│       │       └── hooks/
│       │
│       ├── pages/                # Page components (route targets)
│       │   ├── public/           # Public pages
│       │   │   ├── HomePage/
│       │   │   ├── AboutPage/
│       │   │   ├── ServicesPage/
│       │   │   ├── ServiceDetailPage/
│       │   │   ├── ProjectsPage/
│       │   │   ├── ProjectDetailPage/
│       │   │   ├── ExperiencePage/
│       │   │   ├── GalleryPage/
│       │   │   ├── CertificatesPage/
│       │   │   ├── BlogPage/
│       │   │   ├── BlogPostPage/
│       │   │   ├── AIAssistantPage/
│       │   │   ├── ContactPage/
│       │   │   ├── TestimonialsPage/
│       │   │   ├── FAQPage/
│       │   │   ├── BusinessCheckerPage/
│       │   │   ├── SupportCompanyPage/
│       │   │   └── NotFoundPage/
│       │   │
│       │   └── admin/            # Admin pages
│       │       ├── DashboardPage/
│       │       ├── LoginPage/
│       │       ├── ProjectsManagerPage/
│       │       ├── GalleryManagerPage/
│       │       ├── BlogManagerPage/
│       │       ├── ServicesManagerPage/
│       │       ├── CertificatesManagerPage/
│       │       ├── TimelineManagerPage/
│       │       ├── TestimonialsManagerPage/
│       │       ├── LeadsManagerPage/
│       │       ├── AppointmentsManagerPage/
│       │       ├── MessagesManagerPage/
│       │       ├── AIManagerPage/
│       │       ├── MediaManagerPage/
│       │       ├── AnalyticsPage/
│       │       ├── SettingsPage/
│       │       ├── UsersManagerPage/
│       │       └── LogsPage/
│       │
│       ├── hooks/                # Shared custom hooks
│       │   ├── useAuth.ts
│       │   ├── useTheme.ts
│       │   ├── useLanguage.ts
│       │   ├── useMediaQuery.ts
│       │   ├── useDebounce.ts
│       │   ├── useLocalStorage.ts
│       │   └── useScrollPosition.ts
│       │
│       ├── store/                # Zustand state stores
│       │   ├── useAuthStore.ts
│       │   ├── useThemeStore.ts
│       │   ├── useLanguageStore.ts
│       │   ├── useChatStore.ts
│       │   └── useUIStore.ts
│       │
│       ├── services/             # API service layer
│       │   ├── api.ts            # Axios/fetch instance
│       │   ├── auth.service.ts
│       │   ├── projects.service.ts
│       │   ├── gallery.service.ts
│       │   ├── services.service.ts
│       │   ├── blog.service.ts
│       │   ├── certificates.service.ts
│       │   ├── experiences.service.ts
│       │   ├── testimonials.service.ts
│       │   ├── contact.service.ts
│       │   ├── leads.service.ts
│       │   ├── appointments.service.ts
│       │   ├── ai.service.ts
│       │   ├── settings.service.ts
│       │   ├── analytics.service.ts
│       │   ├── media.service.ts
│       │   └── investors.service.ts
│       │
│       ├── lib/                  # Utilities and helpers
│       │   ├── utils.ts          # General utilities
│       │   ├── cn.ts             # Tailwind class merger
│       │   ├── formatters.ts     # Date, number formatters
│       │   ├── validators.ts     # Zod schemas
│       │   └── constants.ts      # App constants
│       │
│       ├── config/               # Frontend configuration
│       │   ├── routes.ts         # Route definitions
│       │   ├── navigation.ts     # Nav menu structure
│       │   ├── theme.ts          # Theme configuration
│       │   └── seo.ts            # SEO defaults
│       │
│       ├── i18n/                 # Internationalization
│       │   ├── config.ts         # i18next configuration
│       │   ├── en.json           # English translations
│       │   └── sw.json           # Swahili translations
│       │
│       └── types/                # Shared TypeScript types
│           ├── api.types.ts      # API response types
│           ├── models.types.ts   # Data model types
│           ├── auth.types.ts     # Auth types
│           └── common.types.ts   # Common utility types
│
├── backend/                      # Node.js + Express Backend
│   ├── package.json              # Backend dependencies
│   ├── tsconfig.json             # TypeScript configuration
│   ├── Dockerfile                # Backend Docker build
│   │
│   └── src/                      # Backend source code
│       ├── server.ts             # Express server entry point
│       ├── app.ts                # Express app configuration
│       │
│       ├── config/               # Configuration
│       │   ├── database.ts       # Prisma client instance
│       │   ├── jwt.ts            # JWT configuration
│       │   ├── mail.ts           # Email configuration
│       │   ├── cors.ts           # CORS configuration
│       │   └── env.ts            # Environment validation
│       │
│       ├── controllers/          # Request handlers
│       │   ├── auth.controller.ts
│       │   ├── project.controller.ts
│       │   ├── gallery.controller.ts
│       │   ├── service.controller.ts
│       │   ├── blog.controller.ts
│       │   ├── certificate.controller.ts
│       │   ├── experience.controller.ts
│       │   ├── testimonial.controller.ts
│       │   ├── chat.controller.ts     # Chatbot REST handler
│       │   ├── contact.controller.ts
│       │   ├── lead.controller.ts
│       │   ├── appointment.controller.ts
│       │   ├── investor.controller.ts
│       │   ├── settings.controller.ts
│       │   ├── analytics.controller.ts
│       │   ├── media.controller.ts
│       │   ├── user.controller.ts
│       │   ├── notification.controller.ts
│       │   └── dashboard.controller.ts
│       │
│       ├── middleware/            # Express middleware
│       │   ├── auth.middleware.ts
│       │   ├── admin.middleware.ts
│       │   ├── error.middleware.ts
│       │   ├── upload.middleware.ts
│       │   ├── rateLimiter.middleware.ts
│       │   ├── validator.middleware.ts
│       │   └── logger.middleware.ts
│       │
│       ├── routes/               # API route definitions
│       │   ├── index.ts          # Route aggregator
│       │   ├── auth.routes.ts
│       │   ├── project.routes.ts
│       │   ├── gallery.routes.ts
│       │   ├── service.routes.ts
│       │   ├── blog.routes.ts
│       │   ├── certificate.routes.ts
│       │   ├── experience.routes.ts
│       │   ├── testimonial.routes.ts
│       │   ├── chat.routes.ts         # Chatbot routes
│       │   ├── contact.routes.ts
│       │   ├── lead.routes.ts
│       │   ├── appointment.routes.ts
│       │   ├── investor.routes.ts
│       │   ├── settings.routes.ts
│       │   ├── analytics.routes.ts
│       │   ├── media.routes.ts
│       │   ├── user.routes.ts
│       │   ├── notification.routes.ts
│       │   └── dashboard.routes.ts
│       │
│       ├── services/             # Business logic
│       │   ├── auth.service.ts
│       │   ├── project.service.ts
│       │   ├── gallery.service.ts
│       │   ├── service.service.ts
│       │   ├── blog.service.ts
│       │   ├── certificate.service.ts
│       │   ├── experience.service.ts
│       │   ├── testimonial.service.ts
│       │   ├── ollama.service.ts      # Low-level Ollama driver
│       │   ├── chat.service.ts        # Chat transactions & cache
│       │   ├── lead.service.ts        # CRM lead operations
│       │   ├── booking.service.ts
│       │   ├── contact.service.ts
│       │   ├── investor.service.ts
│       │   ├── settings.service.ts
│       │   ├── analytics.service.ts
│       │   ├── email.service.ts
│       │   ├── media.service.ts
│       │   ├── notification.service.ts
│       │   ├── crm.service.ts
│       │   ├── recommendation.service.ts # Service matching engine
│       │   └── audit.service.ts
│       │
│       ├── ai/                   # Modular AI Pipeline
│       │   ├── config/
│       │   │   └── ollama.ts         # Ollama config
│       │   ├── prompt-builder.ts     # Builds prompts and contexts
│       │   ├── knowledge-loader.ts   # Retrieves DB knowledge articles
│       │   ├── conversation-manager.ts # Chat logic orchestration
│       │   ├── intent-classifier.ts  # Classifies intents
│       │   ├── lead-scoring.ts       # Assigns lead scores & grades
│       │   ├── response-validator.ts # Filters off-topic generation
│       │   ├── tool-router.ts        # Executes system actions
│       │   ├── memory.ts             # Conversation summarization
│       │   ├── session-manager.ts    # Tracks session activity/TTL
│       │   ├── system-prompt.ts      # Base prompt instructions
│       │   └── guards.ts             # Input/output safety filters
│       │
│       ├── validators/           # Request validation schemas
│       │   ├── auth.validator.ts
│       │   ├── project.validator.ts
│       │   ├── blog.validator.ts
│       │   ├── lead.validator.ts
│       │   ├── contact.validator.ts
│       │   ├── appointment.validator.ts
│       │   └── common.validator.ts
│       │
│       ├── utils/                # Utility functions
│       │   ├── logger.ts         # Winston logger setup
│       │   ├── response.ts       # Standardized API responses
│       │   ├── helpers.ts        # General helpers
│       │   ├── slugify.ts        # URL slug generation
│       │   └── pagination.ts     # Pagination helpers
│       │
│       └── types/                # Backend TypeScript types
│           ├── express.d.ts      # Express type extensions
│           ├── api.types.ts      # API types
│           └── common.types.ts   # Shared types
│
├── database/                     # Database management
│   ├── migrations/               # Prisma migration history
│   ├── seeds/                    # Seed data scripts
│   │   ├── index.ts              # Seed orchestrator
│   │   ├── users.seed.ts
│   │   ├── roles.seed.ts
│   │   ├── services.seed.ts
│   │   ├── settings.seed.ts
│   │   └── languages.seed.ts
│   └── sql/                      # Raw SQL scripts (if needed)
│
├── prisma/                       # Prisma ORM
│   └── schema.prisma             # Database schema
│
├── shared/                       # Shared code (frontend + backend)
│   └── types/                    # Shared TypeScript interfaces
│       └── index.ts
│
├── nginx/                        # NGINX configuration
│   ├── nginx.conf                # Main NGINX config
│   └── ssl/                      # SSL certificates (git-ignored)
│
├── .github/                      # GitHub configuration
│   └── workflows/
│       ├── deploy.yml            # CI/CD deployment
│       └── test.yml              # CI testing
│
└── .vscode/                      # VS Code workspace settings
    ├── settings.json
    ├── extensions.json
    └── launch.json
```

---

## Centralized Image Library Architecture

### 1. Centralized Image Constants Mapping
All public assets are centralized inside [images.ts](file:///d:/Projects/denis-chamkaga-platform/frontend/src/constants/images.ts). UI components MUST import these constant mappings rather than hardcoding file paths in components:
```typescript
import { IMAGES } from '@/constants/images';

// Inside component:
<img src={IMAGES.hero.portrait} alt="Denis Portrait" loading="lazy" />
```

### 2. Image Replacement Guide
To replace temporary placeholders with actual photographs and assets:
- Locate the target image key in [images.ts](file:///d:/Projects/denis-chamkaga-platform/frontend/src/constants/images.ts) to identify its filepath under `public/images/`.
- Overwrite the existing WebP file inside that path with the new asset, keeping the exact filename (highly recommended).
- Alternatively, place the new file in the folder and update the matching string value inside `images.ts`.

### 3. Naming Convention & Optimization Standards
- **File Format:** Use modern WebP format for all graphics, illustrations, and mockups.
- **Naming Style:** Use lowercase snake_case for filenames (e.g., `security_operations.webp`, `udcc_campus.webp`).
- **Optimization Strategy:**
  - Enforce `loading="lazy"` on all off-screen cards to preserve bandwidth.
  - Declare strict dimensions (`width` and `height`) or use Tailwind aspect-ratio utilities (`aspect-video`, `aspect-square`) to prevent layout shifts during asset loading.
  - Include descriptive `alt` tags representing structural context for high SEO indexation scores.

---

## Notes

1. **Every component directory** contains at minimum: `ComponentName.tsx` and `index.ts`
2. **Page directories** contain: `PageName.tsx`, `index.ts`, and optionally component files
3. **node_modules** directories are git-ignored and not shown above
4. **uploads/** directory is created at runtime by the backend (git-ignored)
5. **dist/** directories are build outputs (git-ignored)
