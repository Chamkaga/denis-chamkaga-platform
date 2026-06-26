import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, Globe, ExternalLink } from 'lucide-react';
import { Logo } from '../../atoms/Logo';
import { ROUTES } from '../../../config/routes';
import { SOCIALS } from '../../../constants/socials';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    { name: t('nav.home'), path: ROUTES.HOME },
    { name: t('nav.about'), path: ROUTES.ABOUT },
    { name: t('nav.services'), path: ROUTES.SERVICES },
    { name: t('nav.projects'), path: ROUTES.PROJECTS },
    { name: t('nav.experience'), path: ROUTES.EXPERIENCE },
    { name: t('nav.blog'), path: ROUTES.BLOG },
    { name: t('nav.contact'), path: ROUTES.CONTACT },
  ];

  return (
    <footer className="border-t dark:border-zinc-800/80 light:border-slate-200 dark:bg-[#070708] light:bg-slate-50 transition-colors duration-300 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Top Section Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Column 1: Logo & Short Professional Intro (5 cols) */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <Logo size="md" />
            <p className="text-sm dark:text-zinc-400 light:text-slate-600 leading-relaxed max-w-md">
              Denis Chamkaga is a Business Information Technology Professional, Web Software Developer, and Systems Consultant based in Tanzania. He bridges the gap between company workflows, database normalization, and automated CRM/POS systems.
            </p>
            
            {/* Social Icons row with proper accessibility tags */}
            <div className="flex flex-wrap gap-4 pt-2">
              {Object.values(SOCIALS).map((soc) => (
                <a
                  key={soc.name}
                  href={soc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2.5 rounded-xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/20 light:bg-white text-zinc-400 transition-all duration-300 ${soc.colorClass} focus:outline-none focus:ring-2 focus:ring-accent-violet`}
                  aria-label={`Visit Denis Chamkaga official ${soc.name} profile`}
                >
                  <svg 
                    className="w-5 h-5 fill-current" 
                    viewBox={soc.viewBox || '0 0 24 24'} 
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d={soc.svgPath} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (3 cols) */}
          <div className="lg:col-span-3 space-y-6 text-left">
            <h3 className="text-sm font-semibold tracking-wider uppercase dark:text-zinc-300 light:text-slate-700">
              Quick Navigation
            </h3>
            <ul className="grid grid-cols-1 gap-3">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm dark:text-zinc-400 light:text-slate-500 transition-colors hover:text-accent-violet light:hover:text-light-accent focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Contact & Digital Office Details (4 cols) */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <h3 className="text-sm font-semibold tracking-wider uppercase dark:text-zinc-300 light:text-slate-700">
              Digital Office & Contact
            </h3>
            <ul className="space-y-4 text-sm dark:text-zinc-400 light:text-slate-600">
              <li className="flex items-center gap-3">
                <Phone size={16} className="text-accent-violet shrink-0" />
                <a 
                  href={SOCIALS.whatsApp.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline flex items-center gap-1 focus:outline-none focus:ring-1 focus:ring-accent-violet rounded"
                >
                  <span>{t('footer.phone')} (WhatsApp Primary)</span>
                  <ExternalLink size={10} className="inline shrink-0" />
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={16} className="text-accent-violet shrink-0" />
                <a 
                  href={`mailto:${t('footer.email')}`}
                  className="hover:underline focus:outline-none focus:ring-1 focus:ring-accent-violet rounded"
                >
                  {t('footer.email')}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <MapPin size={16} className="text-accent-violet shrink-0" />
                <span>{t('footer.location')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Globe size={16} className="text-accent-violet shrink-0" />
                <span className="truncate">{t('footer.website')}</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Metadata & Credits Section */}
        <div className="mt-16 pt-8 border-t dark:border-zinc-800/80 light:border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 text-xs dark:text-zinc-500 light:text-slate-400 text-center md:text-left">
          
          {/* Copyright & Designed & Developed Credits */}
          <div className="space-y-1">
            <p>
              &copy; {currentYear} Denis Chamkaga. {t('footer.rights')}
            </p>
            <p className="dark:text-zinc-600 light:text-slate-400">
              Designed & Developed by <span className="font-semibold text-accent-violet">Denis Chamkaga</span>
            </p>
          </div>

          {/* Built With Tech Stack Disclosures */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-6">
            <span className="font-medium dark:text-zinc-600 light:text-slate-400">
              Built with React · TypeScript · Vite · Node.js
            </span>
            <Link 
              to={ROUTES.ADMIN_LOGIN} 
              className="hover:text-accent-violet transition-colors focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-1"
            >
              {t('nav.adminConsole')}
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
};

