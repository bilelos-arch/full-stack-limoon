'use client';

import { useAuthStore } from '@/stores/authStore';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { BookOpen, Sparkles, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const { logout } = useAuth();
  const router = useRouter();

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
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#0055FF]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] pt-28 pb-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-light tracking-tight text-slate-900 mb-3">
            Bienvenue,{' '}
            <span className="font-normal text-[#0055FF]">{user?.email?.split('@')[0]}</span>
          </h1>
          <p className="text-lg text-slate-500 font-light">
            Gérez vos histoires et votre compte
          </p>
        </motion.div>

        {/* User Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="antigravity-card p-8 mb-8"
        >
          <h2 className="text-xl font-semibold text-slate-900 mb-6">Informations du compte</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-slate-500 mb-1 font-light">Email</p>
              <p className="text-slate-900 font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1 font-light">Rôle</p>
              <p className="text-slate-900 font-medium capitalize">{user?.role}</p>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1 font-light">ID</p>
              <p className="text-slate-900 font-mono text-sm">{user?.userId?.slice(0, 8)}...</p>
            </div>
          </div>
        </motion.div>

        {/* Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/histoires" className="block antigravity-card p-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#0055FF]/10 flex items-center justify-center mb-4 group-hover:bg-[#0055FF]/20 transition-colors">
                <BookOpen className="w-6 h-6 text-[#0055FF]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Mes histoires</h3>
              <p className="text-sm text-slate-500 font-light">Gérez vos histoires personnalisées</p>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/book-store" className="block antigravity-card p-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all group">
              <div className="w-12 h-12 rounded-lg bg-[#0055FF]/10 flex items-center justify-center mb-4 group-hover:bg-[#0055FF]/20 transition-colors">
                <Sparkles className="w-6 h-6 text-[#0055FF]" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Créer une histoire</h3>
              <p className="text-sm text-slate-500 font-light">Découvrez nos templates disponibles</p>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/profil" className="block antigravity-card p-6 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] transition-all group">
              <div className="w-12 h-12 rounded-lg bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-slate-200 transition-colors">
                <Settings className="w-6 h-6 text-slate-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">Paramètres</h3>
              <p className="text-sm text-slate-500 font-light">Gérez votre profil</p>
            </Link>
          </motion.div>
        </div>

        {/* Admin Actions */}
        {user?.role === 'admin' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="antigravity-card p-6 mb-8"
          >
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Administration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start h-11" asChild>
                <Link href="/admin">Panneau d'administration</Link>
              </Button>
              <Button variant="outline" className="justify-start h-11" asChild>
                <Link href="/admin/templates">Gestion des templates</Link>
              </Button>
            </div>
          </motion.div>
        )}

        {/* Logout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <Button
            onClick={logout}
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-11"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Se déconnecter
          </Button>
        </motion.div>
      </div>
    </div>
  );
}