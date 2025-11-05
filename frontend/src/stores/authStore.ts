import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '@/lib/authApi';
import { AxiosError } from 'axios';

export interface User {
  _id: string;
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
      logout: () => {
        console.log('authStore.logout: Déconnexion initiée');
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
        // ⚠️ NE PLUS rediriger automatiquement ici
        // La redirection sera gérée par le composant qui utilise ce store
      },
      setUser: (user: User) => set({ user }),
      setLoading: (loading: boolean) => set({ isLoading: loading }),
      setError: (error: string | null) => set({ error }),
      checkAuth: async () => {
        try {
          console.log('checkAuth: Fetching user profile...');
          set({ isLoading: true, error: null });
          const user = await authApi.getProfile();
          console.log('checkAuth: User profile fetched:', user);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          if (error instanceof AxiosError && error.response?.status === 401) {
            console.error('checkAuth: 401 error detected, triggering global logout');
            // Déclencher la déconnexion globale avec redirection
            get().logout();
            set({ isLoading: false });
          } else {
            console.error('checkAuth: Failed to fetch user profile:', error);
            // Clear persisted state on failure but don't call logout API
            set({ user: null, isAuthenticated: false, isLoading: false, error: null });
          }
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