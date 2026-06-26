import { create } from 'zustand';

type Theme = 'dark' | 'light';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  initializeTheme: () => void;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: 'dark', // default

  setTheme: (theme: Theme) => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme-preference', theme);
    set({ theme });
  },

  toggleTheme: () => {
    const nextTheme = get().theme === 'dark' ? 'light' : 'dark';
    get().setTheme(nextTheme);
  },

  initializeTheme: () => {
    const cachedTheme = localStorage.getItem('theme-preference') as Theme | null;
    if (cachedTheme) {
      get().setTheme(cachedTheme);
    } else {
      const systemPreference = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
      get().setTheme(systemPreference);
    }
  }
}));
