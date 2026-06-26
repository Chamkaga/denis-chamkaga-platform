# Requirements

> Denis Chamkaga Portfolio & AI Business Platform

---

## 1. Business Requirements

### 1.1 Vision

Build a production-grade digital platform that serves as Denis Chamkaga's:

- **Personal Brand** — Professional online presence
- **Digital Office** — Business operations hub
- **AI Assistant** — Automated visitor engagement and lead qualification
- **CRM** — Customer relationship management
- **Business Platform** — Service delivery and investor relations
- **Future Company Foundation** — Scalable base for Terrasafi T Ltd

### 1.2 Business Objectives

| # | Objective | Priority |
|---|-----------|----------|
| B1 | Showcase professional portfolio and expertise | Critical |
| B2 | Automate visitor engagement through AI | Critical |
| B3 | Capture and qualify business leads | Critical |
| B4 | Enable appointment booking | High |
| B5 | Manage content through admin dashboard | High |
| B6 | Support multilingual audience (EN/SW) | High |
| B7 | Attract investors for Terrasafi T Ltd | Medium |
| B8 | Publish blog content and thought leadership | Medium |
| B9 | Provide analytics and visitor insights | Medium |
| B10 | Serve as foundation for future SaaS products | Low (Future) |

---

## 2. Functional Requirements

### 2.1 Portfolio Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-P01 | Display professional profile with photo, title, and summary | Critical |
| FR-P02 | Show career timeline with positions and achievements | Critical |
| FR-P03 | Display skills with categories and proficiency levels | Critical |
| FR-P04 | Showcase projects with images, descriptions, tech stack, links | Critical |
| FR-P05 | Display project gallery with categories and filtering | Critical |
| FR-P06 | Show certificates and awards with images and verification | High |
| FR-P07 | Display client testimonials with ratings | High |
| FR-P08 | Show experience section with work history | Critical |
| FR-P09 | Present education and training history | High |

### 2.2 Services Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-S01 | List all services with descriptions and pricing tiers | Critical |
| FR-S02 | Service detail pages with scope and deliverables | Critical |
| FR-S03 | Request quote functionality per service | High |
| FR-S04 | Business checker — evaluate business technology needs | High |
| FR-S05 | Service recommendation engine integration with AI | Medium |

### 2.3 AI Assistant Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-A01 | Persistent chat widget on all pages | Critical |
| FR-A02 | AI introduces itself as Denis's assistant (never as Denis) | Critical |
| FR-A03 | Answer questions about Denis, services, and projects | Critical |
| FR-A04 | Intent detection for visitor needs | Critical |
| FR-A05 | Lead qualification with scoring (cold/warm/hot) | Critical |
| FR-A06 | Collect visitor contact information naturally | High |
| FR-A07 | Recommend relevant services based on conversation | High |
| FR-A08 | Book appointments through conversation | High |
| FR-A09 | Handoff to Denis when confidence is low | High |
| FR-A10 | Maintain conversation context and memory | High |
| FR-A11 | Support English and Swahili responses | Medium |
| FR-A12 | Knowledge base about Denis's background and services | Critical |

### 2.4 Contact & Lead Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-C01 | Contact form with name, email, phone, message | Critical |
| FR-C02 | Lead capture from AI conversations | Critical |
| FR-C03 | Lead scoring and categorization | High |
| FR-C04 | Email notification to Denis on new leads | High |
| FR-C05 | WhatsApp notification integration (future) | Medium |
| FR-C06 | Appointment booking calendar | High |

### 2.5 Blog Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-B01 | Blog listing with pagination | High |
| FR-B02 | Blog detail pages with rich content | High |
| FR-B03 | Categories and tags for filtering | Medium |
| FR-B04 | Search functionality | Medium |
| FR-B05 | Share buttons for social media | Low |

### 2.6 Admin Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-D01 | Secure admin login (JWT) | Critical |
| FR-D02 | Dashboard with analytics overview | Critical |
| FR-D03 | CRUD for projects | Critical |
| FR-D04 | CRUD for gallery items | Critical |
| FR-D05 | CRUD for blog posts | High |
| FR-D06 | CRUD for services | High |
| FR-D07 | CRUD for certificates | High |
| FR-D08 | CRUD for testimonials | High |
| FR-D09 | Manage career timeline | High |
| FR-D10 | View and manage leads | Critical |
| FR-D11 | View and manage appointments | High |
| FR-D12 | View AI conversation logs | High |
| FR-D13 | Manage site settings | High |
| FR-D14 | Manage theme preferences | Medium |
| FR-D15 | Manage languages and translations | Medium |
| FR-D16 | Media manager for images | High |
| FR-D17 | View analytics and visitor data | Medium |
| FR-D18 | System logs and audit trail | Medium |
| FR-D19 | User management (future multi-admin) | Low |

### 2.7 Investor Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-I01 | Investor information page for Terrasafi T Ltd | Medium |
| FR-I02 | Investment opportunity descriptions | Medium |
| FR-I03 | Investor inquiry form | Medium |
| FR-I04 | Support company page | Medium |

### 2.8 Authentication Module

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AU01 | Admin login with email and password | Critical |
| FR-AU02 | JWT access and refresh token management | Critical |
| FR-AU03 | Password hashing with bcrypt | Critical |
| FR-AU04 | Protected route middleware | Critical |
| FR-AU05 | Role-based access control | High |
| FR-AU06 | Session management | High |

---

## 3. Non-Functional Requirements

### 3.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-P01 | First Contentful Paint | < 1.5 seconds |
| NFR-P02 | Largest Contentful Paint | < 2.5 seconds |
| NFR-P03 | Time to Interactive | < 3 seconds |
| NFR-P04 | API response time (average) | < 200ms |
| NFR-P05 | Lighthouse Performance Score | > 90 |
| NFR-P06 | Bundle size (initial JS) | < 200KB gzipped |

### 3.2 Responsiveness

| ID | Requirement | Breakpoints |
|----|-------------|-------------|
| NFR-R01 | Mobile | 320px — 639px |
| NFR-R02 | Tablet | 640px — 1023px |
| NFR-R03 | Laptop | 1024px — 1279px |
| NFR-R04 | Desktop | 1280px — 1535px |
| NFR-R05 | Ultra-wide | 1536px+ |

### 3.3 Accessibility

| ID | Requirement |
|----|-------------|
| NFR-A01 | WCAG 2.1 AA compliance |
| NFR-A02 | Full keyboard navigation |
| NFR-A03 | Screen reader compatibility |
| NFR-A04 | Minimum contrast ratio 4.5:1 |
| NFR-A05 | ARIA labels on all interactive elements |
| NFR-A06 | Focus visible indicators |
| NFR-A07 | Skip navigation links |

### 3.4 SEO

| ID | Requirement |
|----|-------------|
| NFR-S01 | Schema.org structured data |
| NFR-S02 | Open Graph meta tags |
| NFR-S03 | Twitter Card meta tags |
| NFR-S04 | Canonical URLs |
| NFR-S05 | XML Sitemap |
| NFR-S06 | robots.txt |
| NFR-S07 | Semantic HTML structure |
| NFR-S08 | Unique title and meta description per page |

### 3.5 Security

| ID | Requirement |
|----|-------------|
| NFR-SE01 | HTTPS everywhere |
| NFR-SE02 | Security headers via Helmet |
| NFR-SE03 | Rate limiting on authentication endpoints |
| NFR-SE04 | Input sanitization and validation |
| NFR-SE05 | SQL injection prevention (Prisma) |
| NFR-SE06 | XSS prevention |
| NFR-SE07 | CSRF protection |
| NFR-SE08 | Environment variable isolation |
| NFR-SE09 | Audit logging for admin actions |

### 3.6 Internationalization

| ID | Requirement |
|----|-------------|
| NFR-I01 | English (default language) |
| NFR-I02 | Swahili (secondary language) |
| NFR-I03 | No hardcoded text in components |
| NFR-I04 | Language preference persistence |
| NFR-I05 | RTL-ready architecture (future) |

### 3.7 Theme

| ID | Requirement |
|----|-------------|
| NFR-T01 | Dark mode (default) |
| NFR-T02 | Light mode |
| NFR-T03 | System preference detection |
| NFR-T04 | Theme preference persistence |

### 3.8 Reliability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-RE01 | Uptime | 99.5% |
| NFR-RE02 | Error recovery | Graceful degradation |
| NFR-RE03 | Data backup | Daily automated backups |
| NFR-RE04 | Zero data loss | Transaction-safe operations |
