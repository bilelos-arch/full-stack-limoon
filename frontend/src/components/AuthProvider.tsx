'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    console.log('AuthProvider: Vérification de l\'authentification pour:', pathname);
    checkAuth();
  }, [checkAuth, pathname]);

  // ⚠️ NOUVEAU: Gérer les redirections quand l'utilisateur n'est pas authentifié
  useEffect(() => {
    const publicRoutes = ['/login', '/register', '/', '/book-store', '/le-concept', '/politique-confidentialite'];
    const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
    
    if (!isAuthenticated && !isPublicRoute && user === null) {
      console.log('AuthProvider: Redirection vers /login pour route protégée:', pathname);
      router.push('/login');
    }
  }, [isAuthenticated, user, pathname, router]);

  return <>{children}</>;
}