import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/authApi';

export interface User {
  userId: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      login: (user: User) =>
        set({
          user,
          isAuthenticated: true,
          error: null,
        }),
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        }),
      setUser: (user: User) => set({ user }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      checkAuth: async () => {
        try {
          set({ isLoading: true, error: null });
          const user = await authApi.getProfile();
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          // Clear persisted state on failure but don't call logout API
          set({ user: null, isAuthenticated: false, isLoading: false, error: null });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);