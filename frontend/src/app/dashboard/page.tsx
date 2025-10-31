'use client';

import { useAuthStore } from '@/stores/authStore';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { logout } = useAuth();
  const router = useRouter();

  // Utiliser le hook de rafraîchissement des tokens
  useTokenRefresh();

  useEffect(() => {
    const verifyAuth = async () => {
      if (!isAuthenticated) {
        await checkAuth();
      }
    };
    verifyAuth();
  }, [isAuthenticated, checkAuth]);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>Redirection en cours...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Informations utilisateur</h2>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Rôle:</strong> {user?.role}</p>
            <p><strong>ID:</strong> {user?.userId}</p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Actions disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="justify-start">
                  Mes histoires
                </Button>
                <Button variant="outline" className="justify-start">
                  Templates disponibles
                </Button>
                {user?.role === 'admin' && (
                  <>
                    <Button variant="outline" className="justify-start">
                      Gestion des templates
                    </Button>
                    <Button variant="outline" className="justify-start">
                      Administration
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="pt-4 border-t">
              <Button onClick={logout} variant="destructive">
                Se déconnecter
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}