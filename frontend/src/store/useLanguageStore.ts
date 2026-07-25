import { create } from 'zustand';
import i18n from 'i18next';

export type Language = 'en' | 'sw';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
  initializeLanguage: () => void;
}

// Helper — normalize any i18next language code to our two supported ones
const normalize = (lng: string): Language => (lng === 'sw' ? 'sw' : 'en');

export const useLanguageStore = create<LanguageState>((set) => ({
  // Seed from i18n immediately so lazy-loaded pages get the right value
  language: normalize(i18n.language || 'en'),

  setLanguage: (lang: Language) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language-preference', lang);
    set({ language: lang });
  },

  initializeLanguage: () => {
    const saved = localStorage.getItem('language-preference') as Language | null;
    const target: Language = saved
      ? saved
      : navigator.language.split('-')[0] === 'sw' ? 'sw' : 'en';

    i18n.changeLanguage(target);
    set({ language: target });

    // Mirror every future i18next language change back into the Zustand store
    // so that pages using `useLanguageStore` re-render correctly on client navigation
    i18n.on('languageChanged', (lng: string) => {
      set({ language: normalize(lng) });
    });
  },
}));
