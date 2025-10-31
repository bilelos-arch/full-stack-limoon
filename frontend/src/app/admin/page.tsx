'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
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
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/story');
      return;
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-6">Tableau de Bord Administrateur</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Gestion des Templates</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Créer, modifier et gérer les templates de contenu.
              </p>
              <Button onClick={() => router.push('/admin/templates')}>
                Templates
              </Button>
            </div>
            {/* Placeholder for future admin features */}
            <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Utilisateurs</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Gérer les comptes utilisateurs.
              </p>
              <Button variant="outline" disabled>
                Bientôt disponible
              </Button>
            </div>
            <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Statistiques</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Voir les statistiques d'utilisation.
              </p>
              <Button variant="outline" disabled>
                Bientôt disponible
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}