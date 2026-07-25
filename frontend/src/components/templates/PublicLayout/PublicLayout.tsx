import React, { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Navbar } from '../../organisms/Navbar';
import { Footer } from '../../organisms/Footer';
import { ChatWidget } from '../../organisms/ChatWidget';
import { BackToTop } from '../../atoms/BackToTop/BackToTop';
import { useHashScroll } from '../../../hooks/useHashScroll';
import { GlobalErrorBoundary } from '../../organisms/GlobalErrorBoundary';

export const PublicLayout: React.FC = () => {
  const location = useLocation();
  useHashScroll(); // Automatically scroll to hash anchors dynamically

  // Scroll to top on every route change immediately
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [location.pathname]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-20 overflow-x-hidden">
        <GlobalErrorBoundary key={location.pathname}>
          <Outlet />
        </GlobalErrorBoundary>
      </main>
      <Footer />
      <ChatWidget />
      <BackToTop />
    </div>
  );
};

export default PublicLayout;

