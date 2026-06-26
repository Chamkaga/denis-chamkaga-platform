import { create } from 'zustand';

interface UIState {
  isMobileMenuOpen: boolean;
  isChatOpen: boolean;
  chatMode: 'widget' | 'page';
  toggleMobileMenu: (force?: boolean) => void;
  toggleChat: (force?: boolean) => void;
  setChatMode: (mode: 'widget' | 'page') => void;
}

export const useUIStore = create<UIState>((set) => ({
  isMobileMenuOpen: false,
  isChatOpen: false,
  chatMode: 'widget',

  toggleMobileMenu: (force) => set((state) => ({ 
    isMobileMenuOpen: force !== undefined ? force : !state.isMobileMenuOpen 
  })),

  toggleChat: (force) => set((state) => ({ 
    isChatOpen: force !== undefined ? force : !state.isChatOpen 
  })),

  setChatMode: (mode) => set({ chatMode: mode })
}));
