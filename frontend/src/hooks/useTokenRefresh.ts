'use client';

import { useEffect, useCallback } from 'react';
import { authApi } from '@/lib/authApi';
import { useAuthStore } from '@/stores/authStore';

export const useTokenRefresh = () => {
  const { setError, setUser } = useAuthStore();

  const refreshToken = useCallback(async () => {
    try {
      await authApi.refreshToken();
      // Fetch user profile after successful refresh
      const userProfile = await authApi.getProfile();
      setUser(userProfile);
    } catch (err: any) {
      setError('Session expirée, veuillez vous reconnecter');
      // Ici on pourrait déclencher une redirection vers /login
    }
  }, [setError, setUser]);

  useEffect(() => {
    // Rafraîchir le token toutes les 10 minutes (avant l'expiration de 15 minutes)
    const interval = setInterval(refreshToken, 10 * 60 * 1000);

    return () => clearInterval(interval);
  }, [refreshToken]);

  return { refreshToken };
};