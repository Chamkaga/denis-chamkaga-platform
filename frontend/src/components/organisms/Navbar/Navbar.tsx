import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, X, Sun, Moon, Globe, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThemeStore } from '../../../store/useThemeStore';
import { useLanguageStore } from '../../../store/useLanguageStore';
import { useUIStore } from '../../../store/useUIStore';
import { Logo } from '../../atoms/Logo';
import { Button } from '../../atoms/Button';
import { ROUTES } from '../../../config/routes';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { theme, toggleTheme } = useThemeStore();
  const { language, setLanguage } = useLanguageStore();
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: t('nav.home'), path: ROUTES.HOME },
    { name: t('nav.about'), path: ROUTES.ABOUT },
    { name: t('nav.services'), path: ROUTES.SERVICES },
    { name: t('nav.projects'), path: ROUTES.PROJECTS },
    { name: t('nav.gallery'), path: ROUTES.GALLERY },
    { name: t('nav.certificates'), path: ROUTES.CERTIFICATES },
    { name: t('nav.blog'), path: ROUTES.BLOG },
    { name: t('nav.denisAssistant'), path: ROUTES.DENIS_ASSISTANT },
    { name: t('nav.futureVision'), path: ROUTES.FUTURE_VISION },
    { name: t('nav.contact'), path: ROUTES.CONTACT },
  ];

  const handleNavClick = (path: string) => {
    toggleMobileMenu(false);
    navigate(path);
  };

  const handleLangSelect = (lang: 'en' | 'sw') => {
    setLanguage(lang);
    setIsLangDropdownOpen(false);
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass-navbar shadow-lg py-3' : 'bg-transparent py-5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <Link to={ROUTES.HOME} className="flex items-center">
          <Logo size="md" />
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-3.5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`font-semibold text-xs transition-colors duration-200 hover:text-accent-violet light:hover:text-light-accent ${
                  isActive 
                    ? 'dark:text-accent-violet light:text-light-accent font-bold' 
                    : 'dark:text-zinc-400 light:text-slate-600'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Action Controls & CTA */}
        <div className="hidden lg:flex items-center gap-4">
          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full cursor-pointer transition-colors duration-200 dark:hover:bg-zinc-800/80 light:hover:bg-slate-200/80 dark:text-zinc-300 light:text-slate-600"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Language Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="p-2 rounded-full cursor-pointer flex items-center gap-1 transition-colors duration-200 dark:hover:bg-zinc-800/80 light:hover:bg-slate-200/80 dark:text-zinc-300 light:text-slate-600"
              aria-label="Switch Language"
            >
              <Globe size={18} />
              <span className="text-xs font-semibold uppercase">{language}</span>
            </button>

            <AnimatePresence>
              {isLangDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setIsLangDropdownOpen(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-32 rounded-lg shadow-xl py-1 border glass-panel z-20"
                  >
                    <button
                      onClick={() => handleLangSelect('en')}
                      className={`w-full text-left px-4 py-2 text-sm cursor-pointer hover:bg-zinc-800/60 dark:text-white light:text-slate-700 ${
                        language === 'en' ? 'font-semibold text-accent-violet' : ''
                      }`}
                    >
                      English
                    </button>
                    <button
                      onClick={() => handleLangSelect('sw')}
                      className={`w-full text-left px-4 py-2 text-sm cursor-pointer hover:bg-zinc-800/60 dark:text-white light:text-slate-700 ${
                        language === 'sw' ? 'font-semibold text-accent-violet' : ''
                      }`}
                    >
                      Swahili
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>

          {/* Contact Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(ROUTES.CONTACT)}
            rightIcon={<ArrowRight size={14} />}
          >
            {t('nav.getInTouch')}
          </Button>
        </div>

        {/* Mobile Control Toggles */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full cursor-pointer transition-colors duration-200 dark:hover:bg-zinc-800/80 light:hover:bg-slate-200/80 dark:text-zinc-300 light:text-slate-600"
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <button
            onClick={() => setLanguage(language === 'en' ? 'sw' : 'en')}
            className="p-2 rounded-full cursor-pointer flex items-center gap-1 transition-colors duration-200 dark:hover:bg-zinc-800/80 light:hover:bg-slate-200/80 dark:text-zinc-300 light:text-slate-600"
          >
            <Globe size={18} />
            <span className="text-xs font-semibold uppercase">{language}</span>
          </button>

          <button
            onClick={() => toggleMobileMenu()}
            className="p-2 rounded-full cursor-pointer transition-colors duration-200 dark:hover:bg-zinc-800/80 light:hover:bg-slate-200/80 dark:text-zinc-300 light:text-slate-600"
            aria-label="Toggle Mobile Menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-b dark:border-zinc-800 light:border-slate-200 dark:bg-primary-bg light:bg-light-bg overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.path;
                return (
                  <button
                    key={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className={`text-left py-3 px-4 rounded-lg font-medium text-base transition-colors ${
                      isActive 
                        ? 'dark:bg-zinc-800/80 light:bg-slate-200 dark:text-accent-violet light:text-light-accent font-semibold' 
                        : 'dark:text-zinc-400 light:text-slate-600 hover:bg-zinc-900/40'
                    }`}
                  >
                    {link.name}
                  </button>
                );
              })}
              <div className="pt-4 border-t dark:border-zinc-800 light:border-slate-200 px-4">
                <Button
                  variant="primary"
                  fullWidth
                  onClick={() => handleNavClick(ROUTES.CONTACT)}
                >
                  {t('nav.getInTouch')}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
