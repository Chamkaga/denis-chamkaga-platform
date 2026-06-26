# Pages

> Denis Chamkaga Portfolio & AI Business Platform

---

## Route Architecture

All routes use React Router v7. The application has two primary layout regions:

1. **Public Layout** — Navbar, Footer, AI Chat Widget, pages for visitors
2. **Admin Layout** — Sidebar, Top Bar, authenticated admin pages

---

## Public Pages

### 1. Home Page

| Property | Value |
|----------|-------|
| Route | `/` |
| Layout | Public |
| Title | `Denis Chamkaga — Business & Technology Solutions` |
| Purpose | Hero, services preview, project highlights, AI intro, CTA |
| Priority | Critical |

**Sections:**
- Hero (profile photo, name, title, CTA buttons)
- Stats bar (years experience, projects completed, clients, systems)
- Services overview (top 4-6 services)
- Featured projects (3-4 highlighted projects)
- Testimonials carousel
- AI Assistant introduction
- Call to action (Contact / Hire)

---

### 2. About Page

| Property | Value |
|----------|-------|
| Route | `/about` |
| Layout | Public |
| Title | `About Denis Chamkaga — Journey, Skills, Education` |
| Purpose | Full professional profile with career story |
| Priority | Critical |

**Sections:**
- Professional profile (photo, extended bio)
- Career journey timeline
- Skills grid (categorized by domain)
- Education and training
- Awards and recognition

---

### 3. Services Page

| Property | Value |
|----------|-------|
| Route | `/services` |
| Layout | Public |
| Title | `Services — Denis Chamkaga` |
| Purpose | Full list of services offered |
| Priority | Critical |

**Sections:**
- Services grid with cards
- Each card: icon, title, description, CTA

---

### 4. Service Detail Page

| Property | Value |
|----------|-------|
| Route | `/services/:slug` |
| Layout | Public |
| Title | `{Service Name} — Denis Chamkaga` |
| Purpose | Detailed service description with scope and CTA |
| Priority | High |

**Sections:**
- Service hero (title, description)
- What's included
- Deliverables
- Technologies used
- Related projects
- Request quote CTA

---

### 5. Projects Page

| Property | Value |
|----------|-------|
| Route | `/projects` |
| Layout | Public |
| Title | `Projects — Denis Chamkaga` |
| Purpose | Showcase all completed projects |
| Priority | Critical |

**Sections:**
- Filter bar (category, technology, status)
- Project grid with cards
- Each card: image, title, tech stack, description preview

---

### 6. Project Detail Page

| Property | Value |
|----------|-------|
| Route | `/projects/:slug` |
| Layout | Public |
| Title | `{Project Name} — Denis Chamkaga` |
| Purpose | Full project case study |
| Priority | Critical |

**Sections:**
- Project hero (title, image, status)
- Description and objectives
- Technology stack
- Screenshots / gallery
- Challenges and solutions
- Live demo / GitHub links
- Related projects

---

### 7. Experience Page

| Property | Value |
|----------|-------|
| Route | `/experience` |
| Layout | Public |
| Title | `Experience & Timeline — Denis Chamkaga` |
| Purpose | Career history and professional timeline |
| Priority | High |

**Sections:**
- Interactive vertical timeline
- Each entry: date range, company, role, description, logo

---

### 8. Gallery Page

| Property | Value |
|----------|-------|
| Route | `/gallery` |
| Layout | Public |
| Title | `Gallery — Denis Chamkaga` |
| Purpose | Visual portfolio with categorized images |
| Priority | High |

**Sections:**
- Category filter tabs
- Masonry/grid image layout
- Lightbox modal on click

---

### 9. Certificates Page

| Property | Value |
|----------|-------|
| Route | `/certificates` |
| Layout | Public |
| Title | `Certificates & Awards — Denis Chamkaga` |
| Purpose | Professional certifications and achievements |
| Priority | High |

**Sections:**
- Certificate cards with images
- Issuing organization, date, verification link

---

### 10. Blog Page

| Property | Value |
|----------|-------|
| Route | `/blog` |
| Layout | Public |
| Title | `Blog — Denis Chamkaga` |
| Purpose | Published articles and insights |
| Priority | High |

**Sections:**
- Featured post hero
- Post list with pagination
- Category sidebar/filter
- Search bar

---

### 11. Blog Post Page

| Property | Value |
|----------|-------|
| Route | `/blog/:slug` |
| Layout | Public |
| Title | `{Post Title} — Denis Chamkaga Blog` |
| Purpose | Full blog article |
| Priority | High |

**Sections:**
- Post header (title, author, date, category, reading time)
- Rich content body
- Tags
- Share buttons
- Related posts

---

### 12. AI Assistant Page

| Property | Value |
|----------|-------|
| Route | `/ai-assistant` |
| Layout | Public |
| Title | `AI Business Assistant — Denis Chamkaga` |
| Purpose | Full-page AI chat experience |
| Priority | Critical |

**Sections:**
- Full-screen chat interface
- Suggested conversation starters
- Chat history (session-based)
- AI disclaimer

Note: The AI chat widget is also available as a floating component on all public pages.

---

### 13. Contact Page

| Property | Value |
|----------|-------|
| Route | `/contact` |
| Layout | Public |
| Title | `Contact Denis Chamkaga` |
| Purpose | Contact form and business information |
| Priority | Critical |

**Sections:**
- Contact form (name, email, phone, subject, message)
- Business contact info (email, phone, location)
- Social media links
- Map or location indicator
- Office hours

---

### 14. Testimonials Page

| Property | Value |
|----------|-------|
| Route | `/testimonials` |
| Layout | Public |
| Title | `Testimonials — Denis Chamkaga` |
| Purpose | Client reviews and endorsements |
| Priority | Medium |

**Sections:**
- Testimonial cards with ratings
- Client name, company, photo

---

### 15. FAQ Page

| Property | Value |
|----------|-------|
| Route | `/faq` |
| Layout | Public |
| Title | `FAQ — Denis Chamkaga` |
| Purpose | Frequently asked questions |
| Priority | Medium |

**Sections:**
- Categorized accordion FAQ items

---

### 16. Business Checker Page

| Property | Value |
|----------|-------|
| Route | `/business-checker` |
| Layout | Public |
| Title | `Business Technology Checker — Denis Chamkaga` |
| Purpose | Interactive tool to assess business tech needs |
| Priority | High |

**Sections:**
- Multi-step form / questionnaire
- Results with recommendations
- CTA to discuss with Denis

---

### 17. Investor / Support Company Page

| Property | Value |
|----------|-------|
| Route | `/support-company` |
| Layout | Public |
| Title | `Support Terrasafi T Ltd — Denis Chamkaga` |
| Purpose | Investor information and company vision |
| Priority | Medium |

**Sections:**
- Terrasafi T Ltd vision and mission
- Investment opportunities
- Ways to support
- Investor inquiry form

---

### 18. 404 Page

| Property | Value |
|----------|-------|
| Route | `*` (catch-all) |
| Layout | Public |
| Title | `Page Not Found — Denis Chamkaga` |
| Purpose | User-friendly error page |
| Priority | High |

---

## Admin Pages

### 19. Admin Login

| Property | Value |
|----------|-------|
| Route | `/admin/login` |
| Layout | Minimal (no sidebar) |
| Auth | Public (login form) |
| Priority | Critical |

---

### 20. Admin Dashboard

| Property | Value |
|----------|-------|
| Route | `/admin` |
| Layout | Admin |
| Auth | Required (admin role) |
| Priority | Critical |

**Sections:**
- Stats cards (total leads, projects, messages, visitors)
- Recent leads table
- Recent messages
- AI conversation summary
- Quick actions

---

### 21-34. Admin Management Pages

| Route | Purpose | Auth |
|-------|---------|------|
| `/admin/projects` | Manage projects (CRUD) | Admin |
| `/admin/projects/new` | Create new project | Admin |
| `/admin/projects/:id/edit` | Edit project | Admin |
| `/admin/gallery` | Manage gallery | Admin |
| `/admin/blog` | Manage blog posts | Admin |
| `/admin/blog/new` | Create blog post | Admin |
| `/admin/blog/:id/edit` | Edit blog post | Admin |
| `/admin/services` | Manage services | Admin |
| `/admin/certificates` | Manage certificates | Admin |
| `/admin/timeline` | Manage career timeline | Admin |
| `/admin/testimonials` | Manage testimonials | Admin |
| `/admin/leads` | View and manage leads | Admin |
| `/admin/appointments` | Manage appointments | Admin |
| `/admin/messages` | View contact messages | Admin |
| `/admin/ai` | AI conversation logs and settings | Admin |
| `/admin/media` | Media file manager | Admin |
| `/admin/users` | User management | Admin |
| `/admin/settings` | Site settings | Admin |
| `/admin/analytics` | Detailed analytics | Admin |
| `/admin/logs` | System and audit logs | Admin |

---

## Layout Components

### Public Layout

```
┌─────────────────────────────────────────┐
│              Navbar                      │
│  Logo · Nav Links · Theme · Lang · CTA  │
├─────────────────────────────────────────┤
│                                         │
│           Page Content                  │
│                                         │
├─────────────────────────────────────────┤
│              Footer                      │
│  Links · Social · Copyright · Legal    │
├─────────────────────────────────────────┤
│        AI Chat Widget (floating)        │
└─────────────────────────────────────────┘
```

### Admin Layout

```
┌──────────┬──────────────────────────────┐
│          │         Top Bar              │
│          │  Search · Notifications · User│
│ Sidebar  ├──────────────────────────────┤
│          │                              │
│ Nav Menu │       Page Content           │
│          │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```
