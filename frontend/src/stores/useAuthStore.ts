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
  rememberMe: boolean;
  setRememberMe: (remember: boolean) => void;
  login: (user: User, accessToken: string, refreshToken: string, rememberMe?: boolean) => void;
  logout: () => void;
}

const getInitialState = () => {
  try {
    const accessToken = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
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
  if (typeof window !== 'undefined') {
    window.addEventListener('auth-logout', () => {
      set({ isAuthenticated: false, user: null });
    });
  }

  return {
    ...initialState,
    rememberMe: true,

    setRememberMe: (remember: boolean) => set({ rememberMe: remember }),

    login: (user, accessToken, refreshToken, rememberMe = true) => {
      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('accessToken', accessToken);
      storage.setItem('refreshToken', refreshToken);
      storage.setItem('user', JSON.stringify(user));
      set({ isAuthenticated: true, user, rememberMe });
    },

    logout: () => {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      sessionStorage.removeItem('user');
      set({ isAuthenticated: false, user: null });
    },
  };
});
