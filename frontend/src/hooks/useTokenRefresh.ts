'use client';

import { useEffect, useCallback, useRef } from 'react';
import { authApi } from '@/lib/authApi';
import { useAuthStore } from '@/stores/authStore';

export const useTokenRefresh = () => {
  const { setError, setUser, logout, isAuthenticated } = useAuthStore();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const refreshToken = useCallback(async () => {
    try {
      console.log('useTokenRefresh.refreshToken: Tentative de rafraîchissement du token');
      await authApi.refreshToken();
      // Fetch user profile after successful refresh
      const userProfile = await authApi.getProfile();
      setUser(userProfile);
      console.log('useTokenRefresh.refreshToken: Token rafraîchi avec succès');
    } catch (err: any) {
      console.error('useTokenRefresh.refreshToken: Échec du rafraîchissement du token:', err);
      setError('Session expirée, veuillez vous reconnecter');
      // Déclencher la déconnexion et redirection
      logout();
    }
  }, [setError, setUser, logout]);

  useEffect(() => {
    if (isAuthenticated) {
      // Rafraîchir le token toutes les 10 minutes (avant l'expiration de 15 minutes)
      intervalRef.current = setInterval(refreshToken, 10 * 60 * 1000);
    } else {
      // Nettoyer le timer si non authentifié
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refreshToken, isAuthenticated]);

  return { refreshToken };
};