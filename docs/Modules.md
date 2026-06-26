# Modules

> Denis Chamkaga Portfolio & AI Business Platform

---

## Module Overview

The platform is organized into independent, self-contained modules. Each module owns its data, business logic, API endpoints, and frontend pages.

```
┌──────────────────────────────────────────────────────────────┐
│                       PUBLIC MODULES                         │
├──────────┬──────────┬───────────┬──────────┬────────────────┤
│ Portfolio│ Services │    AI     │  Contact │     Blog       │
│          │          │ Assistant │  & Lead  │                │
├──────────┴──────────┴───────────┴──────────┴────────────────┤
│                      BUSINESS MODULES                        │
├──────────┬──────────┬───────────┬──────────┬────────────────┤
│   CRM    │ Booking  │ Investor  │ Business │   Analytics    │
│          │          │ Relations │ Checker  │                │
├──────────┴──────────┴───────────┴──────────┴────────────────┤
│                      ADMIN MODULES                           │
├──────────┬──────────┬───────────┬──────────┬────────────────┤
│Dashboard │ Content  │   Media   │  Users   │   Settings     │
│          │ Manager  │  Manager  │ & Roles  │                │
├──────────┴──────────┴───────────┴──────────┴────────────────┤
│                      SYSTEM MODULES                          │
├──────────┬──────────┬───────────┬──────────┬────────────────┤
│   Auth   │  Theme   │   i18n   │   SEO    │   Logging      │
│          │          │           │          │                │
└──────────┴──────────┴───────────┴──────────┴────────────────┘
```

---

## 1. Portfolio Module

**Purpose**: Showcase Denis's professional background, skills, and accomplishments.

### Sub-Modules

| Sub-Module | Description | Database Tables |
|------------|-------------|-----------------|
| Profile | Personal information, photo, title, bio | users |
| Projects | Software projects with details, images, links | projects |
| Gallery | Visual portfolio of work samples | gallery |
| Certificates | Professional certifications and awards | certificates |
| Career Timeline | Work experience and career progression | experiences |
| Skills | Technical and professional skills | skills (JSON or dedicated table) |
| Education | Academic qualifications and training | education |
| Testimonials | Client reviews and endorsements | testimonials |

### Dependencies
- Media Manager (for images)
- i18n (for translations)
- SEO (for structured data)

---

## 2. Services Module

**Purpose**: Present business services and enable service inquiries.

### Sub-Modules

| Sub-Module | Description | Database Tables |
|------------|-------------|-----------------|
| Service Listing | All available services with descriptions | services |
| Service Detail | Individual service pages with scope | services |
| Business Checker | Evaluate business technology needs | (stateless / leads) |
| Quote Request | Request pricing for specific services | leads, messages |

### Dependencies
- AI Assistant (service recommendations)
- Lead Module (capture inquiries)
- Contact Module (form submission)

---

## 3. AI Assistant Module

**Purpose**: Automated visitor engagement, lead qualification, and business advisory.

### Sub-Modules

| Sub-Module | Description | Database Tables |
|------------|-------------|-----------------|
| Conversation Engine | Core chat loop and response generation | chat_sessions, ai_conversations |
| Intent Detection | Classify visitor intent from messages | — (runtime) |
| Lead Qualification | Score leads based on conversation signals | leads |
| Recommendation Engine | Suggest relevant services | — (runtime) |
| Knowledge Base | Denis's background, services, FAQ | ai_knowledge |
| Context Memory | Maintain conversation state per session | chat_sessions |
| Human Handoff | Escalate to Denis when AI confidence is low | leads, notifications |
| Appointment Assistant | Book appointments through chat | appointments |

### Dependencies
- Ollama (LLM inference)
- Lead Module (lead storage)
- Booking Module (appointment creation)
- Notification Module (alerts to Denis)

---

## 4. Contact & Lead Module

**Purpose**: Capture visitor information and manage business leads.

### Sub-Modules

| Sub-Module | Description | Database Tables |
|------------|-------------|-----------------|
| Contact Form | Standard contact form | messages |
| Lead Capture | From AI conversations and forms | leads |
| Lead Scoring | Classify cold/warm/hot | leads |
| Lead Management | Admin CRUD for leads | leads |
| Notifications | Alert Denis on new leads | notifications |

### Dependencies
- AI Assistant (lead source)
- Email Service (notifications)
- Admin Module (management UI)

---

## 5. Blog Module

**Purpose**: Content marketing and thought leadership.

### Sub-Modules

| Sub-Module | Description | Database Tables |
|------------|-------------|-----------------|
| Post Listing | Paginated blog list with previews | blog_posts |
| Post Detail | Full blog post with rich content | blog_posts |
| Categories | Blog categorization | categories |
| Tags | Blog tagging system | tags, blog_post_tags |
| Search | Full-text search across posts | blog_posts |

### Dependencies
- Admin Module (content management)
- SEO Module (meta tags, schema)
- i18n Module (translated content)

---

## 6. Booking Module

**Purpose**: Enable appointment scheduling.

### Sub-Modules

| Sub-Module | Description | Database Tables |
|------------|-------------|-----------------|
| Calendar View | Available time slots | appointments |
| Booking Form | Appointment request form | appointments |
| Confirmation | Booking confirmation flow | appointments, notifications |

### Dependencies
- Contact Module (visitor info)
- AI Assistant (chat-based booking)
- Email Service (confirmations)

---

## 7. CRM Module

**Purpose**: Manage customer relationships and business pipeline.

### Sub-Modules

| Sub-Module | Description | Database Tables |
|------------|-------------|-----------------|
| Lead Pipeline | Track leads through stages | leads |
| Message History | All visitor messages | messages |
| Appointment Tracker | Manage scheduled meetings | appointments |
| Analytics | Conversion rates and funnel data | analytics |

### Dependencies
- Lead Module (data source)
- Admin Module (management UI)
- Analytics Module (reporting)

---

## 8. Investor Relations Module

**Purpose**: Attract and manage investor interest for Terrasafi T Ltd.

### Sub-Modules

| Sub-Module | Description | Database Tables |
|------------|-------------|-----------------|
| Company Overview | Terrasafi T Ltd vision and mission | — (static content) |
| Investment Opportunities | Available investment options | investor_requests |
| Investor Inquiry | Contact form for investors | investor_requests |
| Support Company | Ways to support Terrasafi | — (static content) |

### Dependencies
- Contact Module (form handling)
- Admin Module (inquiry management)

---

## 9. Admin Module

**Purpose**: Administrative interface for managing all platform content and operations.

### Sub-Modules

| Sub-Module | Description |
|------------|-------------|
| Dashboard | Analytics overview, recent activity |
| Project Manager | CRUD for projects |
| Gallery Manager | CRUD for gallery items |
| Blog Manager | CRUD for blog posts |
| Service Manager | CRUD for services |
| Certificate Manager | CRUD for certificates |
| Timeline Manager | CRUD for career entries |
| Testimonial Manager | CRUD for testimonials |
| Lead Manager | View and manage leads |
| Appointment Manager | View and manage bookings |
| AI Manager | View conversations, manage knowledge base |
| User Manager | Manage admin users and roles |
| Settings Manager | Site configuration |
| Theme Manager | Theme customization |
| Language Manager | Translation management |
| Media Manager | Upload and manage images/files |
| Analytics Viewer | Detailed visitor and conversion analytics |
| System Logs | Audit trail and activity logs |

### Dependencies
- Auth Module (access control)
- All content modules (data access)

---

## 10. Authentication Module

**Purpose**: Secure admin access with JWT-based authentication.

### Components

| Component | Description |
|-----------|-------------|
| Login | Email/password authentication |
| JWT Manager | Token generation, validation, refresh |
| Middleware | Route protection and role checking |
| Password | Hashing and verification with bcrypt |
| Session | Token lifecycle management |

### Dependencies
- Database (user storage)
- No external dependencies (self-contained)

---

## 11. Theme Module

**Purpose**: Dark/Light mode support with persistent preferences.

### Components

| Component | Description |
|-----------|-------------|
| Theme Provider | React context for theme state |
| Theme Toggle | UI switch component |
| CSS Variables | Dynamic color tokens |
| Persistence | localStorage preference storage |
| System Detection | OS-level theme preference |

---

## 12. Internationalization Module (i18n)

**Purpose**: English and Swahili language support.

### Components

| Component | Description |
|-----------|-------------|
| Language Provider | react-i18next configuration |
| Language Switcher | UI component for language selection |
| Translation Files | EN and SW JSON translation files |
| Persistence | localStorage language preference |

---

## 13. SEO Module

**Purpose**: Search engine optimization across all pages.

### Components

| Component | Description |
|-----------|-------------|
| Meta Manager | react-helmet-async for per-page meta |
| Schema.org | Structured data for portfolio, business |
| Open Graph | Social sharing meta tags |
| Sitemap | XML sitemap generation |
| Robots | robots.txt configuration |

---

## 14. Analytics Module

**Purpose**: Track visitor behavior and business metrics.

### Components

| Component | Description | Database Tables |
|-----------|-------------|-----------------|
| Visitor Tracking | Page views, sessions | visitors, analytics |
| Lead Analytics | Conversion tracking | leads |
| AI Analytics | Chat engagement metrics | ai_conversations |
| Dashboard | Admin analytics view | — (queries) |

---

## 15. Notification Module

**Purpose**: Alert Denis of important events.

### Components

| Component | Description | Database Tables |
|-----------|-------------|-----------------|
| Email Notifications | New leads, appointments, messages | notifications |
| In-App Notifications | Admin dashboard alerts | notifications |
| WhatsApp (Future) | Direct message to Denis | — (external) |
