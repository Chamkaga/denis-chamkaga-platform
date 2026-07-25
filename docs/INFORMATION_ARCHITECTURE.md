# Denis Business Platform — Information Architecture & Site Map Specification

```
Version: 1.0.0
Last Updated: 2026-07-25
Author: Lead UX Architect
Reviewed By: Denis Chamkaga Frontend Team
Approval Status: APPROVED (Official Project Standard)
Related Documents: [PRODUCT_SPECIFICATION.md](file:///d:/Projects/denis-chamkaga-platform/docs/PRODUCT_SPECIFICATION.md), [UI_FLOW.md](file:///d:/Projects/denis-chamkaga-platform/docs/UI_FLOW.md), [README.md](file:///d:/Projects/denis-chamkaga-platform/docs/README.md)
```

---

## 1. Overview & Site Map Hierarchy

The **Information Architecture** structures all public pages, administrative portals, document verification views, and global floating widgets across clear URL paths and layout hierarchy wrappers ([App.tsx](file:///d:/Projects/denis-chamkaga-platform/frontend/src/App.tsx)).

---

## 2. Complete Site Map Hierarchy

```mermaid
graph TD
    Root[Platform Root /] --> PublicSuite[Public Layout Wrapper]
    Root --> AdminAuth[Auth Pages]
    Root --> AdminSuite[Admin Layout Wrapper - RBAC Guarded]
    Root --> PublicDocs[Public Document Token Portal]

    PublicSuite --> Home[/ - Homepage]
    PublicSuite --> About[/about - About Denis]
    PublicSuite --> Services[/services - Business Services]
    PublicSuite --> Projects[/projects - Portfolio Projects]
    PublicSuite --> Experience[/experience - Experience & Timeline]
    PublicSuite --> Gallery[/gallery - Media Gallery]
    PublicSuite --> Certificates[/certificates - Verified Credentials]
    PublicSuite --> Blog[/blog - Articles & Insights]
    PublicSuite --> BlogDetail[/blog/:slug - Article Detail]
    PublicSuite --> Contact[/contact - Contact & Inquiries]
    PublicSuite --> FAQ[/faq - Frequently Asked Questions]
    PublicSuite --> BusinessChecker[/checker - Business Readiness Tool]
    PublicSuite --> FutureVision[/future - Future Ecosystem Vision]
    PublicSuite --> Support[/support - Client Support]

    AdminAuth --> Login[/login - Admin Login]
    AdminAuth --> ForgotPassword[/forgot-password]
    AdminAuth --> ResetPassword[/reset-password]

    AdminSuite --> AdminDashboard[/admin/dashboard - Telemetry KPIs]
    AdminSuite --> PortfolioCms[/admin/cms - Portfolio Projects/Services CRUD]
    AdminSuite --> KnowledgeCms[/admin/ai-knowledge - AI Knowledge Ops]
    AdminSuite --> BusinessAdmin[/admin/crm - CRM Leads & Clients]
    AdminSuite --> MarketingAdmin[/admin/marketing - Campaigns & Newsletter]
    AdminSuite --> CommunicationCenter[/admin/messages - Messages & Calls]
    AdminSuite --> SupportersAdmin[/admin/supporters - Community Supporters]
    AdminSuite --> AnalyticsReports[/admin/analytics - System Telemetry]
    AdminSuite --> SettingsSystem[/admin/settings - Tenant & AI Config]

    PublicDocs --> PublicQuote[/public/docs/quote/:token - Quotation Portal]
    PublicDocs --> PublicInvoice[/public/docs/invoice/:token - Invoice Portal]
```

---

## 3. URL Structure & Route Table

| Path Route Constant | Absolute URL | Layout Container | Target Component |
| :--- | :--- | :--- | :--- |
| `ROUTES.HOME` | `/` | `PublicLayout` | `HomePage.tsx` |
| `ROUTES.ABOUT` | `/about` | `PublicLayout` | `AboutPage.tsx` |
| `ROUTES.SERVICES` | `/services` | `PublicLayout` | `ServicesPage.tsx` |
| `ROUTES.PROJECTS` | `/projects` | `PublicLayout` | `ProjectsPage.tsx` |
| `ROUTES.BLOG` | `/blog` | `PublicLayout` | `BlogPage.tsx` |
| `ROUTES.CONTACT` | `/contact` | `PublicLayout` | `ContactPage.tsx` |
| `ROUTES.ADMIN_LOGIN` | `/login` | Standalone | `LoginPage.tsx` |
| `ROUTES.ADMIN_DASHBOARD` | `/admin/dashboard` | `AdminLayout` | `DashboardPage.tsx` |

---

## 4. Navigation Layout Rules

1. **Global Public Navbar:** Shared across all public routes; features Theme Toggle (Dark/Light), Language Switcher (Swahili/English), and Navigation Links.
2. **Global Floating Chat Widget:** Anchored at bottom-right across all public views.
3. **Admin Collapsible Sidebar:** Left-aligned sidebar with nested grouping (Dashboard, CMS, CRM, Finance OS, AI Ops, Settings).
