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
  | "system"
  | "settings"
  | "media"
  | "support"
  | "marketing"
  | "creator"
  | "innovation"
  | "futureVision"
  | "partnerships";

export type AdminGroup =
  | 'Dashboard'
  | 'Website & Content'
  | 'CRM & Business'
  | 'Communication Center'
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
  // ── 1. Dashboard Operations Center ──────────────────────────────────────────
  {
    labelKey: "nav.dashboard",
    path: ROUTES.ADMIN_DASHBOARD,
    iconKey: "dashboard",
    group: "Dashboard",
    requiredPermission: "Dashboard.READ",
    module: "dashboard",
    sortOrder: 1,
    isVisible: true
  },
  // ── 2. Website & Content Management ──────────────────────────────────────────
  {
    labelKey: "nav.content",
    path: "/admin/content",
    iconKey: "content",
    group: "Website & Content",
    requiredPermission: "Media.READ",
    module: "content",
    sortOrder: 1,
    isVisible: true
  },
  {
    labelKey: "nav.media",
    path: ROUTES.ADMIN_MEDIA,
    iconKey: "media",
    group: "Website & Content",
    requiredPermission: "Media.READ",
    module: "media",
    sortOrder: 2,
    isVisible: true
  },
  // ── 3. CRM & Business Operations ─────────────────────────────────────────────
  {
    labelKey: "nav.business",
    path: "/admin/business",
    iconKey: "business",
    group: "CRM & Business",
    requiredPermission: "Users.READ",
    module: "business",
    sortOrder: 1,
    isVisible: true
  },
  {
    labelKey: "nav.supporters",
    path: "/admin/supporters",
    iconKey: "support",
    group: "CRM & Business",
    module: "supporters",
    sortOrder: 2,
    isVisible: true
  },
  // ── 4. Communication Center ──────────────────────────────────────────────────
  {
    labelKey: "nav.communication",
    path: "/admin/communication",
    iconKey: "support",
    group: "Communication Center",
    module: "communication",
    sortOrder: 1,
    isVisible: true
  },
  // ── 5. AI Platform & Knowledge Engine ────────────────────────────────────────
  {
    labelKey: "nav.knowledgeBase",
    path: "/admin/knowledge",
    iconKey: "ai",
    group: "AI Platform",
    module: "knowledge",
    sortOrder: 1,
    isVisible: true
  },
  {
    labelKey: "nav.aiAssistant",
    path: "/admin/assistant",
    iconKey: "ai",
    group: "AI Platform",
    module: "ai",
    sortOrder: 2,
    isVisible: true
  },
  // ── 6. Marketing & Growth ────────────────────────────────────────────────────
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
  {
    labelKey: "nav.partnerships",
    path: "/admin/partnerships",
    iconKey: "partnerships",
    group: "Marketing & Growth",
    module: "partnerships",
    sortOrder: 3,
    isVisible: true
  },
  // ── 7. Analytics & Reports ───────────────────────────────────────────────────
  {
    labelKey: "nav.analytics",
    path: "/admin/analytics",
    iconKey: "reports",
    group: "Analytics & Reports",
    requiredPermission: "Reports.READ",
    module: "analytics",
    sortOrder: 1,
    isVisible: true
  },
  // ── 8. System Administration & Security ──────────────────────────────────────
  {
    labelKey: "nav.system",
    path: "/admin/settings",
    iconKey: "settings",
    group: "System Administration",
    requiredPermission: "Settings.READ",
    module: "settings",
    sortOrder: 1,
    isVisible: true
  },
  // ── 9. Brand & Strategy ──────────────────────────────────────────────────────
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
  }
];
