import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from './store/useThemeStore';
import { useLanguageStore } from './store/useLanguageStore';
import { PublicLayout } from './components/templates/PublicLayout';
import { AdminLayout } from './components/templates/AdminLayout';
import { ROUTES } from './config/routes';
import { CallProvider } from './context/CallContext';
import { GlobalErrorBoundary } from './components/organisms/GlobalErrorBoundary';
import { ToastProvider } from './components/atoms/Toast';
import { PWAInstallPrompt } from './components/molecules/PWAInstallPrompt/PWAInstallPrompt';
import { PWAUpdateBanner } from './components/molecules/PWAUpdateBanner/PWAUpdateBanner';

// Keep only the landing route eager; route chunks load when requested.
import HomePage from './pages/public/HomePage';
const AboutPage         = React.lazy(() => import('./pages/public/AboutPage'));
const ServicesPage      = React.lazy(() => import('./pages/public/ServicesPage'));
const ProjectsPage      = React.lazy(() => import('./pages/public/ProjectsPage'));
const ContactPage       = React.lazy(() => import('./pages/public/ContactPage'));
const FAQPage           = React.lazy(() => import('./pages/public/FAQPage'));

// ─── Lazy-load secondary public pages ──────────────────────────────────────────
const GalleryPage       = React.lazy(() => import('./pages/public/GalleryPage'));
const TimelinePage      = React.lazy(() => import('./pages/public/TimelinePage'));
const CertificatesPage  = React.lazy(() => import('./pages/public/CertificatesPage'));
const BlogPage          = React.lazy(() => import('./pages/public/BlogPage'));
const BusinessCheckerPage = React.lazy(() => import('./pages/public/BusinessCheckerPage'));
const FutureVisionPage  = React.lazy(() => import('./pages/public/FutureVisionPage'));
const CreatorPage       = React.lazy(() => import('./pages/public/CreatorPage/CreatorPage'));
const PartnerPage       = React.lazy(() => import('./pages/public/PartnerPage/PartnerPage'));
const InnovationPage    = React.lazy(() => import('./pages/public/InnovationPage/InnovationPage'));
const BlogDetailPage    = React.lazy(() => import('./pages/public/BlogPage/BlogDetailPage'));
const SupportPage       = React.lazy(() => import('./pages/public/SupportPage/SupportPage'));
const SupportCallbackPage = React.lazy(() => import('./pages/public/SupportPage/SupportCallbackPage'));
const NotFoundPage        = React.lazy(() => import('./pages/public/NotFoundPage'));

// ─── Lazy-load Admin pages ────────────────────────────────────────────────────
const DashboardPage     = React.lazy(() => import('./pages/admin/DashboardPage'));
const LoginPage         = React.lazy(() => import('./pages/admin/LoginPage'));
const ForgotPasswordPage = React.lazy(() => import('./pages/admin/ForgotPasswordPage'));
const ResetPasswordPage  = React.lazy(() => import('./pages/admin/ResetPasswordPage'));
const KnowledgeCmsPage  = React.lazy(() => import('./pages/admin/KnowledgeCmsPage'));
const Forbidden403Page  = React.lazy(() => import('./pages/public/Forbidden403Page'));
const DamDashboardPage  = React.lazy(() => import('./pages/admin/DamDashboardPage').then(m => ({ default: m.DamDashboardPage })));

const PortfolioCmsPage       = React.lazy(() => import('./pages/admin/PortfolioCmsPage/PortfolioCmsPage').then(m => ({ default: m.PortfolioCmsPage })));
const AssistantAiPage        = React.lazy(() => import('./pages/admin/AdminPages').then(m => ({ default: m.AssistantAiPage })));
const AnalyticsReportsPage   = React.lazy(() => import('./pages/admin/AdminPages').then(m => ({ default: m.AnalyticsReportsPage })));
const SettingsSystemPage     = React.lazy(() => import('./pages/admin/AdminPages').then(m => ({ default: m.SettingsSystemPage })));

const BusinessAdminPage      = React.lazy(() => import('./pages/admin/NewAdminPages').then(m => ({ default: m.BusinessAdminPage })));
const MarketingAdminPage     = React.lazy(() => import('./pages/admin/NewAdminPages').then(m => ({ default: m.MarketingAdminPage })));
const CreatorAdminPage       = React.lazy(() => import('./pages/admin/NewAdminPages').then(m => ({ default: m.CreatorAdminPage })));
const InnovationAdminPage    = React.lazy(() => import('./pages/admin/NewAdminPages').then(m => ({ default: m.InnovationAdminPage })));
const FutureVisionAdminPage  = React.lazy(() => import('./pages/admin/NewAdminPages').then(m => ({ default: m.FutureVisionAdminPage })));
const PartnershipsAdminPage  = React.lazy(() => import('./pages/admin/NewAdminPages').then(m => ({ default: m.PartnershipsAdminPage })));
const CommunicationCenterPage = React.lazy(() => import('./pages/admin/NewAdminPages').then(m => ({ default: m.CommunicationCenterPage })));
const SupportersAdminPage     = React.lazy(() => import('./pages/admin/SupportersAdminPage').then(m => ({ default: m.SupportersAdminPage })));
const OperationsPage          = React.lazy(() => import('./pages/admin/OperationsPage'));
const ReportsCenterPage       = React.lazy(() => import('./pages/admin/ReportsCenterPage'));
const DocumentationCenterPage = React.lazy(() => import('./pages/admin/DocumentationCenterPage'));
const FinancePage             = React.lazy(() => import('./pages/admin/Finance'));
const CRMPage                 = React.lazy(() => import('./pages/admin/CRM'));
const CalendarPage            = React.lazy(() => import('./pages/admin/CalendarPage'));

// ─── Public Document review & checkout pages ──────────────────────────────────
const PublicQuotationView = React.lazy(() => import('./pages/public/PublicQuotationView'));
const PublicInvoiceView   = React.lazy(() => import('./pages/public/PublicInvoiceView'));
const PaymentCallbackView = React.lazy(() => import('./pages/public/PaymentCallbackView'));

// ─── Shared Suspense fallbacks ────────────────────────────────────────────────
const PageLoader: React.FC<{ label?: string }> = ({ label }) => (
  <div className="min-h-[40vh] flex flex-col items-center justify-center gap-2 transition-opacity duration-150">
    <div className="w-6 h-6 rounded-full border-2 border-accent-violet border-t-transparent animate-spin" />
    {label && (
      <p className="text-[11px] text-zinc-400 font-body">{label}</p>
    )}
  </div>
);

// Route chunks normally arrive quickly. Avoid flashing a spinner for those
// short transitions while still giving feedback when a request is genuinely slow.
const DelayedPageLoader: React.FC<{ label?: string; delayMs?: number }> = ({
  label,
  delayMs = 180,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), delayMs);
    return () => window.clearTimeout(timer);
  }, [delayMs]);

  return visible ? <PageLoader label={label} /> : <div className="min-h-[40vh]" aria-hidden="true" />;
};

const withSuspense = (element: React.ReactNode, label?: string) => (
  <React.Suspense fallback={<DelayedPageLoader label={label} />}>
    {element}
  </React.Suspense>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
      staleTime: 1000 * 60 * 5, // 5 minute cache stale time for instant public data
    },
  },
});

export const App: React.FC = () => {
  const initializeTheme    = useThemeStore((state) => state.initializeTheme);
  const initializeLanguage = useLanguageStore((state) => state.initializeLanguage);

  useEffect(() => {
    initializeTheme();
    initializeLanguage();

  }, [initializeTheme, initializeLanguage]);

  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <PWAUpdateBanner />
        <GlobalErrorBoundary>
        <BrowserRouter>
          <Routes>

            {/* ── Public Layout — ALL public pages share Navbar + Footer ── */}
            {/* Standalone Auth & Error Pages */}
            <Route path="/login" element={withSuspense(<LoginPage />)} />
            <Route path="/forgot-password" element={withSuspense(<ForgotPasswordPage />)} />
            <Route path="/reset-password" element={withSuspense(<ResetPasswordPage />)} />
            <Route path="/403" element={withSuspense(<Forbidden403Page />)} />
            <Route element={<PublicLayout />}>
              <Route path={ROUTES.HOME}             element={<HomePage />} />
              <Route path={ROUTES.ABOUT}            element={withSuspense(<AboutPage />)} />
              <Route path={ROUTES.SERVICES}         element={withSuspense(<ServicesPage />)} />
              <Route path={ROUTES.PROJECTS}         element={withSuspense(<ProjectsPage />)} />
              <Route path={ROUTES.EXPERIENCE}       element={withSuspense(<TimelinePage />)} />
              <Route path={ROUTES.GALLERY}          element={withSuspense(<GalleryPage />)} />
              <Route path={ROUTES.CERTIFICATES}     element={withSuspense(<CertificatesPage />)} />
              <Route path={ROUTES.BLOG}             element={withSuspense(<BlogPage />)} />
              <Route path={ROUTES.BLOG_DETAIL}      element={withSuspense(<BlogDetailPage />, 'Loading post...')} />
              <Route path={ROUTES.CONTACT}          element={withSuspense(<ContactPage />)} />
              <Route path={ROUTES.FAQ}              element={withSuspense(<FAQPage />)} />
              <Route path={ROUTES.BUSINESS_CHECKER} element={withSuspense(<BusinessCheckerPage />)} />
              <Route path={ROUTES.FUTURE_VISION}    element={withSuspense(<FutureVisionPage />)} />
              <Route path={ROUTES.CREATOR}          element={withSuspense(<CreatorPage />)} />
              <Route path={ROUTES.PARTNER}          element={withSuspense(<PartnerPage />)} />
              <Route path={ROUTES.INNOVATION}       element={withSuspense(<InnovationPage />)} />
              <Route path={ROUTES.DENIS_ASSISTANT}  element={<Navigate to="/" replace />} />
              <Route path="/assistant" element={<Navigate to="/" replace />} />
              <Route path={ROUTES.SUPPORT}          element={withSuspense(<SupportPage />, 'Loading...')} />
              <Route path={ROUTES.SUPPORT_CALLBACK} element={withSuspense(<SupportCallbackPage />, 'Verifying transaction...')} />

              {/* 404 fallback — still inside PublicLayout so Navbar/Footer shows */}
              <Route path="*" element={withSuspense(<NotFoundPage />, 'Loading...')} />
            </Route>

            {/* ── Admin Auth Layout ─────────────────────────────────────── */}
            <Route path={ROUTES.ADMIN_LOGIN} element={
              <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white"><PageLoader /></div>}>
                <LoginPage />
              </React.Suspense>
            } />

            <Route element={
              <CallProvider>
                <AdminLayout />
              </CallProvider>
            }>
              {/* index removed — / is handled by PublicLayout above */}
              <Route path={ROUTES.ADMIN_DASHBOARD}  element={withSuspense(<DashboardPage />)} />
              <Route path="/admin/dashboard"         element={withSuspense(<DashboardPage />)} />
              <Route path="/admin/knowledge"         element={withSuspense(<KnowledgeCmsPage />)} />
              <Route path="/admin/content"           element={withSuspense(<PortfolioCmsPage />)} />
              <Route path={ROUTES.ADMIN_MEDIA}       element={withSuspense(<DamDashboardPage />)} />
              <Route path="/admin/assistant"         element={withSuspense(<AssistantAiPage />)} />
              <Route path="/admin/business"          element={withSuspense(<BusinessAdminPage />)} />
              <Route path="/admin/projects"          element={withSuspense(<BusinessAdminPage />)} />
              <Route path="/admin/crm"               element={withSuspense(<CRMPage />, 'Loading CRM 360...')} />
              <Route path="/admin/finance"           element={withSuspense(<FinancePage />, 'Loading Finance ERP...')} />
              <Route path="/admin/calendar"          element={withSuspense(<CalendarPage />, 'Loading Business Calendar...')} />
              <Route path="/admin/supporters"        element={withSuspense(<SupportersAdminPage />)} />
              <Route path="/admin/communication"     element={withSuspense(<CommunicationCenterPage />)} />
              <Route path="/admin/communication-center" element={withSuspense(<CommunicationCenterPage />)} />
              <Route path="/admin/marketing"         element={withSuspense(<MarketingAdminPage />)} />
              <Route path="/admin/creator"           element={withSuspense(<CreatorAdminPage />)} />
              <Route path="/admin/innovation"        element={withSuspense(<InnovationAdminPage />)} />
              <Route path="/admin/future-vision"     element={withSuspense(<FutureVisionAdminPage />)} />
              <Route path="/admin/partnerships"      element={withSuspense(<PartnershipsAdminPage />)} />
              <Route path="/admin/analytics"         element={withSuspense(<AnalyticsReportsPage />)} />
              <Route path="/admin/reports-center"    element={withSuspense(<ReportsCenterPage />, 'Loading Reports Center...')} />
              <Route path="/admin/documentation"    element={withSuspense(<DocumentationCenterPage />, 'Loading Documentation...')} />
              <Route path="/admin/settings"          element={withSuspense(<SettingsSystemPage />)} />
              <Route path="/admin/operations"        element={withSuspense(<OperationsPage />, 'Loading Operations...')} />
            </Route>

            {/* ── Public Document review & checkout pages ───────────────── */}
            <Route path={ROUTES.PUBLIC_QUOTATION} element={
              <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white"><PageLoader label="Loading Quotation..." /></div>}>
                <PublicQuotationView />
              </React.Suspense>
            } />

            <Route path={ROUTES.PUBLIC_INVOICE} element={
              <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white"><PageLoader label="Loading Invoice..." /></div>}>
                <PublicInvoiceView />
              </React.Suspense>
            } />

            <Route path={ROUTES.PAYMENT_LINK_PUBLIC} element={
              <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white"><PageLoader label="Loading Payment Link..." /></div>}>
                <PublicInvoiceView />
              </React.Suspense>
            } />

            <Route path={ROUTES.PAYMENT_REDIRECT} element={
              <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center dark:bg-zinc-950 dark:text-white"><PageLoader label="Verifying payment status..." /></div>}>
                <PaymentCallbackView />
              </React.Suspense>
            } />

          </Routes>
        </BrowserRouter>
      </GlobalErrorBoundary>
      <PWAInstallPrompt />
      </ToastProvider>
    </QueryClientProvider>
  );
};

export default App;
