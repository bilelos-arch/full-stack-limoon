'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { AuthLayout } from '@/components/AuthLayout';
import { AuthForm } from '@/components/AuthForm';

export default function LoginPage() {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Redirect authenticated users away from login page
      if (user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, router]);

  // Don't render the login form if user is authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout
      title="Connexion"
      subtitle="Connectez-vous à votre compte"
    >
      <AuthForm />
    </AuthLayout>
  );
}