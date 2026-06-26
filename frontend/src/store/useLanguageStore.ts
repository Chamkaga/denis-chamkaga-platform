import { create } from 'zustand';
import i18n from 'i18next';

export type Language = 'en' | 'sw';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  initializeLanguage: () => void;
}

export const useLanguageStore = create<LanguageState>((set) => ({
  language: 'en', // default

  setLanguage: (lang: Language) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language-preference', lang);
    set({ language: lang });
  },

  initializeLanguage: () => {
    const cachedLang = localStorage.getItem('language-preference') as Language | null;
    if (cachedLang) {
      i18n.changeLanguage(cachedLang);
      set({ language: cachedLang });
    } else {
      const browserLang = navigator.language.split('-')[0];
      const defaultLang: Language = browserLang === 'sw' ? 'sw' : 'en';
      i18n.changeLanguage(defaultLang);
      set({ language: defaultLang });
    }
  }
}));
