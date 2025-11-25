'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useAuthForm } from '@/hooks/useAuthForm';
import Link from 'next/link';

interface AuthFormProps {
  isRegister?: boolean;
}

export const AuthForm = ({ isRegister = false }: AuthFormProps) => {
  const { login, register, isLoading, error } = useAuth();
  const { formData, errors, updateField, validateForm } = useAuthForm(isRegister);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    if (isRegister) {
      await register(formData.name!, formData.email, formData.password, formData.role);
    } else {
      await login(formData.email, formData.password);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-slate-700 font-medium">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={`h-11 ${errors.email ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-slate-700 font-medium">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={(e) => updateField('password', e.target.value)}
            className={`h-11 ${errors.password ? 'border-red-500 focus-visible:ring-red-200' : ''}`}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {isRegister && (
          <div className="space-y-2">
            <Label htmlFor="role" className="text-slate-700 font-medium">Rôle</Label>
            <Select
              value={formData.role}
              onValueChange={(value) => updateField('role', value)}
            >
              <SelectTrigger className="h-11 w-full bg-[#F1F5F9] border-transparent focus:bg-white focus:border-[#0055FF] focus:ring-2 focus:ring-[#0055FF]/20 rounded-lg transition-all duration-200">
                <SelectValue placeholder="Sélectionnez un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {error && (
        <Alert variant="destructive" className="bg-red-50 border-red-100 text-red-900">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" className="w-full h-12 text-base font-medium shadow-lg shadow-blue-500/20 mt-2" disabled={isLoading}>
        {isLoading ? 'Chargement...' : isRegister ? 'S\'inscrire' : 'Se connecter'}
      </Button>

      <div className="text-center text-sm text-slate-500 mt-6">
        {isRegister ? (
          <>
            Déjà un compte ?{' '}
            <Link href="/login" className="text-[#0055FF] hover:underline font-medium">
              Se connecter
            </Link>
          </>
        ) : (
          <>
            Pas encore de compte ?{' '}
            <Link href="/register" className="text-[#0055FF] hover:underline font-medium">
              S'inscrire
            </Link>
          </>
        )}
      </div>
    </form>
  );
};