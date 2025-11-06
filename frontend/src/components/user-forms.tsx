"use client";

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CreateUserData, UserResponse, UpdateUserData } from '@/lib/usersApi';

interface CreateUserFormProps {
  onSubmit: (data: CreateUserData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CreateUserForm({ onSubmit, onCancel, isLoading = false }: CreateUserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateUserData & { confirmPassword: string }>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'user',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password');

  const onFormSubmit = async (data: CreateUserData & { confirmPassword: string }) => {
    const { confirmPassword, ...userData } = data;
    await onSubmit(userData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Nom */}
      <div>
        <Label htmlFor="name">Nom complet *</Label>
        <Input
          id="name"
          {...register('name', {
            required: 'Le nom est requis',
            minLength: {
              value: 2,
              message: 'Le nom doit contenir au moins 2 caractères',
            },
          })}
          placeholder="Nom complet de l'utilisateur"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register('email', {
            required: 'L\'email est requis',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email invalide',
            },
          })}
          placeholder="email@exemple.com"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Rôle */}
      <div>
        <Label htmlFor="role">Rôle *</Label>
        <Select 
          value={watch('role')} 
          onValueChange={(value) => setValue('role', value as 'admin' | 'user')}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Utilisateur</SelectItem>
            <SelectItem value="admin">Administrateur</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Mot de passe */}
      <div>
        <Label htmlFor="password">Mot de passe *</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              required: 'Le mot de passe est requis',
              minLength: {
                value: 6,
                message: 'Le mot de passe doit contenir au moins 6 caractères',
              },
            })}
            placeholder="Mot de passe (min. 6 caractères)"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirmation du mot de passe */}
      <div>
         <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
         <div className="relative">
           <Input
             id="confirmPassword"
             type={showConfirmPassword ? 'text' : 'password'}
             {...register('confirmPassword', {
               required: 'La confirmation du mot de passe est requise',
               validate: (value) => value === watch('password') || 'Les mots de passe ne correspondent pas'
             })}
             placeholder="Confirmer le mot de passe"
             disabled={isLoading}
           />
           <Button
             type="button"
             variant="ghost"
             size="icon-sm"
             className="absolute right-2 top-1/2 transform -translate-y-1/2"
             onClick={() => setShowConfirmPassword(!showConfirmPassword)}
             disabled={isLoading}
           >
             {showConfirmPassword ? (
               <EyeOff className="h-4 w-4" />
             ) : (
               <Eye className="h-4 w-4" />
             )}
           </Button>
         </div>
         {errors.confirmPassword && (
           <p className="mt-1 text-sm text-red-600 dark:text-red-400">
             {errors.confirmPassword.message}
           </p>
         )}
       </div>

      {/* Boutons */}
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Création...' : 'Créer l\'utilisateur'}
        </Button>
      </div>
    </form>
  );
}

interface EditUserFormProps {
  user: UserResponse;
  onSubmit: (data: UpdateUserData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function EditUserForm({ user, onSubmit, onCancel, isLoading = false }: EditUserFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [newPassword, setNewPassword] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<UpdateUserData & { confirmPassword: string }>({
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      password: '',
      confirmPassword: '',
    },
  });

  const watchedPassword = watch('password');

  // Vérifier la correspondance des mots de passe si un nouveau mot de passe est saisi
  React.useEffect(() => {
    if (newPassword && confirmPassword) {
      setPasswordMatch(newPassword === confirmPassword);
    } else {
      setPasswordMatch(true);
    }
  }, [newPassword, confirmPassword]);

  const onFormSubmit = async (data: UpdateUserData & { confirmPassword: string }) => {
    const { password, confirmPassword, ...userData } = data;

    // Si un nouveau mot de passe est fourni, le valider
    if (password) {
      if (password !== confirmPassword) {
        return; // La validation react-hook-form gère cela
      }
      (userData as UpdateUserData).password = password;
    }

    await onSubmit(userData);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      {/* Nom */}
      <div>
        <Label htmlFor="name">Nom complet *</Label>
        <Input
          id="name"
          {...register('name', {
            required: 'Le nom est requis',
            minLength: {
              value: 2,
              message: 'Le nom doit contenir au moins 2 caractères',
            },
          })}
          placeholder="Nom complet de l'utilisateur"
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.name.message}
          </p>
        )}
      </div>

      {/* Email */}
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          {...register('email', {
            required: 'L\'email est requis',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Email invalide',
            },
          })}
          placeholder="email@exemple.com"
          disabled={isLoading}
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.email.message}
          </p>
        )}
      </div>

      {/* Rôle */}
      <div>
        <Label htmlFor="role">Rôle *</Label>
        <Select
          value={watch('role')}
          onValueChange={(value) => setValue('role', value as 'admin' | 'user')}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un rôle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="user">Utilisateur</SelectItem>
            <SelectItem value="admin">Administrateur</SelectItem>
          </SelectContent>
        </Select>
        {errors.role && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.role.message}
          </p>
        )}
      </div>

      {/* Statut */}
      <div>
        <Label htmlFor="status">Statut *</Label>
        <Select
          value={watch('status')}
          onValueChange={(value) => setValue('status', value as 'active' | 'inactive' | 'suspended')}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner un statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Actif</SelectItem>
            <SelectItem value="inactive">Inactif</SelectItem>
            <SelectItem value="suspended">Suspendu</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.status.message}
          </p>
        )}
      </div>

      {/* Nouveau mot de passe */}
      <div>
        <Label htmlFor="password">Nouveau mot de passe (optionnel)</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            {...register('password', {
              minLength: {
                value: 6,
                message: 'Le mot de passe doit contenir au moins 6 caractères',
              },
            })}
            placeholder="Laisser vide pour ne pas changer"
            disabled={isLoading}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </Button>
        </div>
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Confirmation du nouveau mot de passe */}
      {newPassword && (
        <div>
          <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe *</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirmer le nouveau mot de passe"
              disabled={isLoading}
              className={!passwordMatch ? 'border-red-500' : ''}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={isLoading}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </Button>
          </div>
          {!passwordMatch && confirmPassword && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              Les mots de passe ne correspondent pas
            </p>
          )}
        </div>
      )}

      {/* Boutons */}
      <div className="flex gap-2 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={isLoading || (newPassword.length > 0 && !passwordMatch)}
          className="flex-1"
        >
          {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
        </Button>
      </div>
    </form>
  );
}