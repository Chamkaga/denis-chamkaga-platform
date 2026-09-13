import { BadgeKey, FeatureFlag } from '@dc/shared';
import type { Permission } from '@dc/shared';
import { ROUTES } from './routes';

export interface NavItem {
  translationKey: string;
  path: string;
}

export type IconKey =
  | "dashboard"
  | "business"
  | "crm"
  | "content"
  | "ai"
  | "reports"
  | "reportsCenter"
  | "documentation"
  | "system"
  | "settings"
  | "media"
  | "support"
  | "marketing"
  | "creator"
  | "innovation"
  | "futureVision"
  | "partnerships"
  | "operations"
  | "finance"
  | "invoices"
  | "quotes"
  | "contacts"
  | "supporters"
  | "collaborators"
  | "leads"
  | "projects"
  | "portfolio"
  | "services"
  | "users";

export type AdminGroup =
  | 'Dashboard'
  | 'Website & Content'
  | 'CRM & Sales'
  | 'Finance & Accounting'
  | 'Community & Network'
  | 'Communication'
  | 'AI Platform'
  | 'Marketing & Growth'
  | 'Brand & Strategy'
  | 'Analytics & Reports'
  | 'System Administration';

export interface AdminNavItem {
  labelKey: string;             // Localization translation key (e.g. "nav.dashboard")
  path: string;
  iconKey: IconKey;
  group: AdminGroup;
  requiredPermission?: Permission;
  badgeKey?: BadgeKey;          // Typed Badge Key
  featureFlag?: FeatureFlag;    // Typed Feature Flag
  module: string;               // Navigation module context (telemetry/breadcrumbs)
  sortOrder: number;            // Sort precedence index
  isVisible: boolean;           // Show item toggle
}

export const MAIN_NAVIGATION: NavItem[] = [
  { translationKey: 'nav.home', path: ROUTES.HOME },
  { translationKey: 'nav.about', path: ROUTES.ABOUT },
  { translationKey: 'nav.services', path: ROUTES.SERVICES },
  { translationKey: 'nav.projects', path: ROUTES.PROJECTS },
  { translationKey: 'nav.blog', path: ROUTES.BLOG },
  { translationKey: 'nav.creator', path: ROUTES.CREATOR },
  { translationKey: 'nav.futureVision', path: ROUTES.FUTURE_VISION },
  { translationKey: 'nav.partner', path: ROUTES.PARTNER },
  { translationKey: 'nav.contact', path: ROUTES.CONTACT },
];

export const ADMIN_NAVIGATION: AdminNavItem[] = [
  // ── 1. Dashboard ─────────────────────────────────────────────────────────────
  {
    labelKey: "nav.dashboard",
    path: ROUTES.ADMIN_DASHBOARD,
    iconKey: "dashboard",
    group: "Dashboard",
    module: "dashboard",
    sortOrder: 1,
    isVisible: true
  },

  // ── 2. Website & Content ──────────────────────────────────────────────────────
  {
    labelKey: "nav.portfolioCms",
    path: "/admin/content",
    iconKey: "portfolio",
    group: "Website & Content",
    module: "portfolio-cms",
    sortOrder: 1,
    isVisible: true
  },
  {
    labelKey: "nav.services",
    path: "/admin/content?tab=services",
    iconKey: "services",
    group: "Website & Content",
    module: "services-cms",
    sortOrder: 2,
    isVisible: true
  },
  {
    labelKey: "nav.projectsCms",
    path: "/admin/content?tab=projects",
    iconKey: "projects",
    group: "Website & Content",
    module: "projects-cms",
    sortOrder: 3,
    isVisible: true
  },
  {
    labelKey: "nav.knowledge",
    path: "/admin/knowledge",
    iconKey: "ai",
    group: "Website & Content",
    module: "knowledge",
    sortOrder: 4,
    isVisible: true
  },
  {
    labelKey: "nav.media",
    path: ROUTES.ADMIN_MEDIA,
    iconKey: "media",
    group: "Website & Content",
    module: "media",
    sortOrder: 5,
    isVisible: true
  },

  // ── 3. CRM & Sales ────────────────────────────────────────────────────────────
  {
    labelKey: "nav.leads",
    path: "/admin/crm?sub=leads",
    iconKey: "leads",
    group: "CRM & Sales",
    module: "crm-leads",
    sortOrder: 1,
    isVisible: true
  },
  {
    labelKey: "nav.contacts",
    path: "/admin/crm?sub=contacts",
    iconKey: "contacts",
    group: "CRM & Sales",
    module: "crm-contacts",
    sortOrder: 2,
    isVisible: true
  },
  {
    labelKey: "nav.organizations",
    path: "/admin/crm?sub=orgs",
    iconKey: "business",
    group: "CRM & Sales",
    module: "crm-orgs",
    sortOrder: 3,
    isVisible: true
  },
  {
    labelKey: "nav.consultations",
    path: "/admin/crm?sub=consultations",
    iconKey: "crm",
    group: "CRM & Sales",
    module: "crm-consultations",
    sortOrder: 4,
    isVisible: true
  },
  {
    labelKey: "nav.calendar",
    path: "/admin/calendar",
    iconKey: "crm",
    group: "CRM & Sales",
    module: "calendar",
    sortOrder: 5,
    isVisible: true
  },

  // ── 4. Finance & Accounting ───────────────────────────────────────────────────
  {
    labelKey: "nav.quotations",
    path: "/admin/finance?sub=quotes",
    iconKey: "quotes",
    group: "Finance & Accounting",
    module: "finance-quotes",
    sortOrder: 1,
    isVisible: true
  },
  {
    labelKey: "nav.invoices",
    path: "/admin/finance?sub=invoices",
    iconKey: "invoices",
    group: "Finance & Accounting",
    module: "finance-invoices",
    sortOrder: 2,
    isVisible: true
  },
  {
    labelKey: "nav.paymentLinks",
    path: "/admin/finance?sub=payment-links",
    iconKey: "finance",
    group: "Finance & Accounting",
    module: "finance-payment-links",
    sortOrder: 3,
    isVisible: true
  },
  {
    labelKey: "nav.payments",
    path: "/admin/finance?sub=payments",
    iconKey: "finance",
    group: "Finance & Accounting",
    module: "finance-payments",
    sortOrder: 4,
    isVisible: true
  },
  {
    labelKey: "nav.tenantConfig",
    path: "/admin/finance?sub=settings",
    iconKey: "settings",
    group: "Finance & Accounting",
    module: "finance-tenant",
    sortOrder: 5,
    isVisible: true
  },

  // ── 5. Community & Network ─────────────────────────────────────────────────────
  {
    labelKey: "nav.supporters",
    path: "/admin/supporters",
    iconKey: "supporters",
    group: "Community & Network",
    module: "supporters",
    sortOrder: 1,
    isVisible: true
  },
  {
    labelKey: "nav.collaborators",
    path: "/admin/supporters?tab=collaborators",
    iconKey: "collaborators",
    group: "Community & Network",
    module: "collaborators",
    sortOrder: 2,
    isVisible: true
  },
  {
    labelKey: "nav.partnerships",
    path: "/admin/partnerships",
    iconKey: "partnerships",
    group: "Community & Network",
    module: "partnerships",
    sortOrder: 3,
    isVisible: true
  },

  // ── 6. Communication ──────────────────────────────────────────────────────────
  {
    labelKey: "nav.communication",
    path: "/admin/communication",
    iconKey: "support",
    group: "Communication",
    module: "communication",
    sortOrder: 1,
    isVisible: true
  },

  // ── 7. AI Platform & Knowledge Engine ─────────────────────────────────────────
  {
    labelKey: "nav.aiAssistant",
    path: "/admin/assistant",
    iconKey: "ai",
    group: "AI Platform",
    module: "ai",
    sortOrder: 1,
    isVisible: true
  },

  // ── 8. Marketing & Growth ─────────────────────────────────────────────────────
  {
    labelKey: "nav.marketing",
    path: "/admin/marketing",
    iconKey: "marketing",
    group: "Marketing & Growth",
    module: "marketing",
    sortOrder: 1,
    isVisible: true
  },
  {
    labelKey: "nav.creator",
    path: "/admin/creator",
    iconKey: "creator",
    group: "Marketing & Growth",
    module: "creator",
    sortOrder: 2,
    isVisible: true
  },

  // ── 9. Brand & Strategy ────────────────────────────────────────────────────────
  {
    labelKey: "nav.innovation",
    path: "/admin/innovation",
    iconKey: "innovation",
    group: "Brand & Strategy",
    module: "innovation",
    sortOrder: 1,
    isVisible: true
  },
  {
    labelKey: "nav.futureVision",
    path: "/admin/future-vision",
    iconKey: "futureVision",
    group: "Brand & Strategy",
    module: "futureVision",
    sortOrder: 2,
    isVisible: true
  },

  // ── 10. Analytics & Reports ────────────────────────────────────────────────────
  {
    labelKey: "nav.analytics",
    path: "/admin/analytics",
    iconKey: "reports",
    group: "Analytics & Reports",
    module: "analytics",
    sortOrder: 1,
    isVisible: true
  },
  {
    labelKey: "nav.reportsCenter",
    path: "/admin/reports-center",
    iconKey: "reportsCenter",
    group: "Analytics & Reports",
    module: "reports-center",
    sortOrder: 2,
    isVisible: true
  },

  // ── 11. System Administration ──────────────────────────────────────────────────
  {
    labelKey: "nav.operations",
    path: "/admin/operations",
    iconKey: "operations",
    group: "System Administration",
    requiredPermission: "Settings.READ",
    module: "operations",
    sortOrder: 1,
    isVisible: true
  },
  {
    labelKey: "nav.documentation",
    path: "/admin/documentation",
    iconKey: "documentation",
    group: "System Administration",
    module: "documentation",
    sortOrder: 2,
    isVisible: true
  },
  {
    labelKey: "nav.system",
    path: "/admin/settings",
    iconKey: "settings",
    group: "System Administration",
    requiredPermission: "Settings.READ",
    module: "settings",
    sortOrder: 3,
    isVisible: true
  }
];
