import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { ROUTES } from '../../../config/routes';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Label formatting dictionary
  const pathMap: Record<string, string> = {
    admin: 'Admin Console',
    dashboard: 'Owner Dashboard',
    operations: 'Platform Operations',
    business: 'CRM & Leads',
    knowledge: 'Knowledge Base CMS',
    content: 'Portfolio & Media',
    assistant: 'AI Copilot & Command Center',
    analytics: 'Analytics & Reports',
    settings: 'System Settings',
    supporters: 'Supporters & Patrons',
    communication: 'Communication Center',
    marketing: 'Marketing Campaigns',
    creator: 'Creator Studio',
    innovation: 'Innovation Hub',
    'future-vision': 'Future Vision Roadmap',
    partnerships: 'Partnerships'
  };

  return (
    <nav className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium py-1">
      <Link
        to={ROUTES.ADMIN_DASHBOARD}
        className="flex items-center gap-1 text-zinc-400 hover:text-accent-violet transition-colors"
      >
        <Home size={14} />
        <span className="hidden sm:inline">Platform</span>
      </Link>

      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = pathMap[value.toLowerCase()] || value.charAt(0).toUpperCase() + value.slice(1);

        return (
          <React.Fragment key={to}>
            <ChevronRight size={12} className="text-zinc-400 opacity-60" />
            {isLast ? (
              <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate">
                {label}
              </span>
            ) : (
              <Link to={to} className="text-zinc-500 hover:text-accent-violet transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
