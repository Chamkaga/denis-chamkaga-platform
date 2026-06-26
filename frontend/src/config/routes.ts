export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  PROJECTS: '/projects',
  EXPERIENCE: '/experience',
  GALLERY: '/gallery',
  CERTIFICATES: '/certificates',
  BLOG: '/blog',
  CONTACT: '/contact',
  FAQ: '/faq',
  BUSINESS_CHECKER: '/business-checker',
  FUTURE_VISION: '/future-vision',
  DENIS_ASSISTANT: '/denis-assistant',
  
  // Admin Panel
  ADMIN_DASHBOARD: '/admin',
  ADMIN_LOGIN: '/admin/login'
} as const;

export type RouteKeys = keyof typeof ROUTES;
export type RouteValues = typeof ROUTES[RouteKeys];
