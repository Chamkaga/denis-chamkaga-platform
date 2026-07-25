import { create } from 'zustand';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  mustChangePassword: boolean;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

// Helper to load state from localStorage safely
const getInitialState = () => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user');
    if (accessToken && userStr) {
      return {
        isAuthenticated: true,
        user: JSON.parse(userStr) as User,
      };
    }
  } catch (e) {
    console.error('Failed to parse initial auth state', e);
  }
  return {
    isAuthenticated: false,
    user: null,
  };
};

const initialState = getInitialState();

export const useAuthStore = create<AuthState>((set) => {
  // Listen for the custom logout event from axios interceptor
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-logout', () => {
      set({ isAuthenticated: false, user: null });
    });
  }

  return {
    ...initialState,

    login: (user, accessToken, refreshToken) => {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      set({ isAuthenticated: true, user });
    },

    logout: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({ isAuthenticated: false, user: null });
    },
  };
});
