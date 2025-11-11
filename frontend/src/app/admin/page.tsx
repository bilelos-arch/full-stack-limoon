'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import AdminDashboard from '@/components/AdminDashboard';

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
      router.push('/book-store');
      return;
    }
  }, [isAuthenticated, user, router]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Tableau de Bord Administrateur</h1>
            <div className="flex gap-4">
              <Button variant="outline" onClick={() => router.push('/admin/templates')}>
                Gestion des Templates
              </Button>
              <Button variant="outline" onClick={() => router.push('/admin/users')}>
                Gestion des Utilisateurs
              </Button>
            </div>
          </div>

          {/* Dashboard avec statistiques et graphiques */}
          <AdminDashboard />
        </div>
      </div>
    </div>
  );
}