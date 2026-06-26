import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useThemeStore } from './store/useThemeStore';
import { useLanguageStore } from './store/useLanguageStore';
import { PublicLayout } from './components/templates/PublicLayout';
import { AdminLayout } from './components/templates/AdminLayout';
import { ROUTES } from './config/routes';

// Import Public Pages
import HomePage from './pages/public/HomePage';
import AboutPage from './pages/public/AboutPage';
import ServicesPage from './pages/public/ServicesPage';
import ProjectsPage from './pages/public/ProjectsPage';
import GalleryPage from './pages/public/GalleryPage';
import TimelinePage from './pages/public/TimelinePage';
import CertificatesPage from './pages/public/CertificatesPage';
import BlogPage from './pages/public/BlogPage';
import ContactPage from './pages/public/ContactPage';
import FAQPage from './pages/public/FAQPage';
import BusinessCheckerPage from './pages/public/BusinessCheckerPage';
import FutureVisionPage from './pages/public/FutureVisionPage';
import DenisAssistantPage from './pages/public/DenisAssistantPage';

// Import Admin Pages
import DashboardPage from './pages/admin/DashboardPage';
import LoginPage from './pages/admin/LoginPage';

// Import i18n configuration to initialize
import './i18n/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false
    }
  }
});

export const App: React.FC = () => {
  const initializeTheme = useThemeStore((state) => state.initializeTheme);
  const initializeLanguage = useLanguageStore((state) => state.initializeLanguage);

  useEffect(() => {
    initializeTheme();
    initializeLanguage();
  }, [initializeTheme, initializeLanguage]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          
          {/* Public Layout Routes */}
          <Route path={ROUTES.HOME} element={<PublicLayout><HomePage /></PublicLayout>} />
          <Route path={ROUTES.ABOUT} element={<PublicLayout><AboutPage /></PublicLayout>} />
          <Route path={ROUTES.SERVICES} element={<PublicLayout><ServicesPage /></PublicLayout>} />
          <Route path={ROUTES.PROJECTS} element={<PublicLayout><ProjectsPage /></PublicLayout>} />
          <Route path={ROUTES.EXPERIENCE} element={<PublicLayout><TimelinePage /></PublicLayout>} />
          <Route path={ROUTES.GALLERY} element={<PublicLayout><GalleryPage /></PublicLayout>} />
          <Route path={ROUTES.CERTIFICATES} element={<PublicLayout><CertificatesPage /></PublicLayout>} />
          <Route path={ROUTES.BLOG} element={<PublicLayout><BlogPage /></PublicLayout>} />
          <Route path={ROUTES.CONTACT} element={<PublicLayout><ContactPage /></PublicLayout>} />
          <Route path={ROUTES.FAQ} element={<PublicLayout><FAQPage /></PublicLayout>} />
          <Route path={ROUTES.BUSINESS_CHECKER} element={<PublicLayout><BusinessCheckerPage /></PublicLayout>} />
          <Route path={ROUTES.FUTURE_VISION} element={<PublicLayout><FutureVisionPage /></PublicLayout>} />
          <Route path={ROUTES.DENIS_ASSISTANT} element={<PublicLayout><DenisAssistantPage /></PublicLayout>} />

          {/* Admin Auth Layout */}
          <Route path={ROUTES.ADMIN_LOGIN} element={<LoginPage />} />

          {/* Admin Console Layout */}
          <Route path={ROUTES.ADMIN_DASHBOARD} element={<AdminLayout><DashboardPage /></AdminLayout>} />
          
          {/* Fallback 404 Page */}
          <Route path="*" element={
            <PublicLayout>
              <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4 text-center px-4 font-body">
                <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center font-bold text-2xl">404</div>
                <h1 className="text-3xl font-extrabold dark:text-white light:text-slate-800 tracking-tight font-display">Ukurasa Haufatikani / Page Not Found</h1>
                <p className="text-sm dark:text-zinc-500 light:text-slate-500 max-w-sm">The path you specified does not exist in Denis's digital office. Return home to browse active portfolio services.</p>
                <a href={ROUTES.HOME} className="text-xs font-semibold text-accent-violet hover:underline pt-2">Return Home</a>
              </div>
            </PublicLayout>
          } />

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
