'use client';

import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/lib/authApi';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

export const useAuth = () => {
  const { user, isAuthenticated, isLoading, error, login, logout, setUser, setLoading, setError } = useAuthStore();
  const router = useRouter();

  console.log('useAuth hook - user:', user, 'isAuthenticated:', isAuthenticated);

  const handleLogin = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authApi.login({ email, password });
      // Fetch user profile after successful login
      const userProfile = await authApi.getProfile();
      setUser(userProfile);
      if (userProfile.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, setUser, router]);

  const handleRegister = useCallback(async (name: string, email: string, password: string, role: 'admin' | 'user' = 'user') => {
    try {
      setLoading(true);
      setError(null);
      await authApi.register({ name, email, password, role });
      router.push('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erreur d\'inscription');
    } finally {
      setLoading(false);
    }
  }, [setLoading, setError, router]);

  const handleLogout = useCallback(async () => {
    console.log('useAuth.handleLogout: Déconnexion manuelle initiée');
    // Only call logout API if user is authenticated
    if (isAuthenticated) {
      try {
        await authApi.logout();
        console.log('useAuth.handleLogout: API logout réussi');
      } catch (err) {
        console.error('useAuth.handleLogout: Erreur lors de la déconnexion API:', err);
      }
    }
    logout();
    // ⚠️ NOUVEAU: Redirection après déconnexion
    router.push('/login');
  }, [isAuthenticated, logout, router]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };
};