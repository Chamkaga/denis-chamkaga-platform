import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone, Mail, MapPin, ExternalLink } from 'lucide-react';
import { Logo } from '../../atoms/Logo';
import { ROUTES } from '../../../config/routes';
import { SOCIALS } from '../../../constants/socials';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../../../services/api';
import { motion } from 'framer-motion';

// We import MAIN_NAVIGATION correctly
import { MAIN_NAVIGATION as SHARED_NAV } from '../../../config/navigation';

export const Footer: React.FC = () => {
  const { t } = useTranslation();
  const { language } = useLanguageStore();
  const currentYear = new Date().getFullYear();
  const isSwahili = language === 'sw';

  const { data: siteSettings } = useQuery({
    queryKey: ['public-settings'],
    queryFn: () => publicApi.getSettings(),
  });

  const contactPhone = siteSettings?.contact_phone || '+255 620 145 678';
  const contactEmail = siteSettings?.contact_email || 'denischamkaga@gmail.com';
  const contactLocation = siteSettings?.contact_location || 'Dar es Salaam, Tanzania';
  const whatsappUrl = siteSettings?.social_whatsapp
    ? (siteSettings.social_whatsapp.startsWith('http') ? siteSettings.social_whatsapp : `https://wa.me/${siteSettings.social_whatsapp.replace(/[^0-9]/g, '')}`)
    : SOCIALS.whatsApp.url;

  // 1. Company Links (About, Services, Projects, Future Vision, Partner With Me)
  const companyLinks = [
    { name: t('nav.about'), path: ROUTES.ABOUT },
    { name: t('nav.services'), path: ROUTES.SERVICES },
    { name: t('nav.projects'), path: ROUTES.PROJECTS },
    { name: t('nav.futureVision'), path: ROUTES.FUTURE_VISION },
    { name: t('nav.partner'), path: ROUTES.PARTNER },
  ];

  // 2. Quick Navigation Links (Exact mirror of Header)
  const quickLinks = SHARED_NAV.map((link) => ({
    name: t(link.translationKey),
    path: link.path,
  }));

  // 3. Scalable Resources Links Array (No placeholder links to avoid technical debt)
  const resourcesLinks = [
    { name: isSwahili ? 'Saidia Maono' : 'Support the Vision', path: ROUTES.SUPPORT },
    { name: isSwahili ? 'Safari Yangu' : 'My Journey', path: '/about#timeline' },
    { name: isSwahili ? 'Maabara ya Majaribio' : 'Innovation Lab', path: '/creator#innovation-lab' },
  ];

  // Filter out WhatsApp for the generic Follow Me list (already covered in Contact details)
  const socialMedias = Object.values(SOCIALS).filter((soc) => soc.name !== 'WhatsApp');

  return (
    <footer className="border-t dark:border-zinc-800/80 light:border-slate-200 dark:bg-[#070708] light:bg-slate-50 transition-colors duration-300 font-body">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Top 5-Column Grid System */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12 items-start">
          
          {/* Column 1: Brand & Logo */}
          <div className="space-y-6 text-left">
            <Logo size="md" />
            <p className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-600 leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          {/* Column 2: Company */}
          <div className="space-y-5 text-left">
            <h3 className="text-xs font-bold tracking-widest uppercase dark:text-zinc-300 light:text-slate-700 font-display">
              {isSwahili ? 'Kampuni' : 'Company'}
            </h3>
            <ul className="space-y-2.5">
              {companyLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-500 hover:text-accent-violet transition-colors focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div className="space-y-5 text-left">
            <h3 className="text-xs font-bold tracking-widest uppercase dark:text-zinc-300 light:text-slate-700 font-display">
              {isSwahili ? 'Urambazaji wa Haraka' : 'Quick Navigation'}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-500 hover:text-accent-violet transition-colors focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-1"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Resources */}
          <div className="space-y-5 text-left">
            <h3 className="text-xs font-bold tracking-widest uppercase dark:text-zinc-300 light:text-slate-700 font-display">
              {isSwahili ? 'Nyenzo' : 'Resources'}
            </h3>
            <ul className="space-y-2.5">
              {resourcesLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-xs sm:text-sm dark:text-zinc-400 light:text-slate-500 hover:text-accent-violet transition-colors focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-1 font-semibold"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact & Follow Me */}
          <div className="space-y-6 text-left">
            <div className="space-y-5">
              <h3 className="text-xs font-bold tracking-widest uppercase dark:text-zinc-300 light:text-slate-700 font-display">
                {isSwahili ? 'Mawasiliano' : 'Contact'}
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm dark:text-zinc-400 light:text-slate-600">
                <li className="flex items-center gap-2">
                  <Mail size={14} className="text-accent-violet shrink-0" />
                  <a 
                    href={`mailto:${contactEmail}`}
                    className="hover:underline hover:text-accent-violet focus:outline-none focus:ring-1 focus:ring-accent-violet rounded truncate"
                  >
                    {contactEmail}
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone size={14} className="text-accent-violet shrink-0" />
                  <a 
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline hover:text-accent-violet focus:outline-none focus:ring-1 focus:ring-accent-violet rounded flex items-center gap-1"
                  >
                    <span>{contactPhone}</span>
                    <ExternalLink size={10} className="shrink-0 text-zinc-500" />
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MapPin size={14} className="text-accent-violet shrink-0 mt-0.5" />
                  <span>{contactLocation}</span>
                </li>
              </ul>
            </div>

            {/* Follow Me Dynamic Subsection */}
            <div className="space-y-3 pt-2">
              <h4 className="text-[10px] font-bold uppercase tracking-widest dark:text-zinc-400 light:text-slate-600 font-display">
                {isSwahili ? 'Nifuatilie' : 'Follow Me'}
              </h4>
              <div className="flex flex-wrap gap-2">
                {socialMedias.map((soc) => (
                  <motion.a
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    key={soc.name}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`p-2 rounded-xl border dark:border-zinc-800/80 light:border-slate-200 dark:bg-zinc-900/20 light:bg-white text-zinc-400 transition-colors ${soc.colorClass} focus:outline-none focus:ring-2 focus:ring-accent-violet`}
                    aria-label={`Follow Denis on ${soc.name}`}
                  >
                    <svg 
                      className="w-4 h-4 fill-current" 
                      viewBox={soc.viewBox || '0 0 24 24'} 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d={soc.svgPath} />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Section Credits (Premium custom branding lines) */}
        <div className="mt-16 pt-8 border-t dark:border-zinc-800/80 light:border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 text-xs dark:text-zinc-500 light:text-slate-400 text-center md:text-left">
          
          <div className="space-y-1 font-body">
            <p>
              &copy; {currentYear} Denis Chamkaga. {isSwahili ? 'Haki zote zimehifadhiwa.' : 'All rights reserved.'}
            </p>
            <p className="dark:text-zinc-600 light:text-slate-500">
              {isSwahili 
                ? 'Imejengwa kwa shauku, ubunifu, na mafunzo endelevu.' 
                : 'Built with passion, innovation, and continuous learning.'}
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-2 text-xs">
            <span className="font-semibold dark:text-zinc-500 light:text-slate-400 font-display">
              Technology by Terrasafi
            </span>
            <Link 
              to={ROUTES.ADMIN_LOGIN} 
              className="text-[10px] text-zinc-500 hover:text-accent-violet transition-colors focus:outline-none focus:ring-1 focus:ring-accent-violet rounded px-1"
            >
              {t('nav.adminConsole')}
            </Link>
          </div>

        </div>

      </div>
    </footer>
  );
};

export default Footer;
