export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  SERVICES: '/services',
  PROJECTS: '/projects',
  EXPERIENCE: '/experience',
  GALLERY: '/gallery',
  CERTIFICATES: '/certificates',
  BLOG: '/blog',
  BLOG_DETAIL: '/blog/:slug',
  SUPPORT: '/support',
  SUPPORT_CALLBACK: '/support/callback',
  CONTACT: '/contact',
  FAQ: '/faq',
  BUSINESS_CHECKER: '/business-checker',
  FUTURE_VISION: '/future-vision',
  CREATOR: '/creator',
  PARTNER: '/partner',
  INNOVATION: '/innovation',
  DENIS_ASSISTANT: '/denis-assistant',
  
  // Admin Panel
  ADMIN_DASHBOARD: '/admin',
  ADMIN_LOGIN: '/admin/login',
  ADMIN_MEDIA: '/admin/media',

  // Public review and checkout links (unauthenticated)
  PUBLIC_QUOTATION: '/public/quotation/:token',
  PUBLIC_INVOICE: '/public/invoice/:token',
  PAYMENT_REDIRECT: '/public/invoice/payment-redirect',
} as const;

export type RouteKeys = keyof typeof ROUTES;
export type RouteValues = typeof ROUTES[RouteKeys];
