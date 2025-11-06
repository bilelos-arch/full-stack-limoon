"use client";

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './dialog';
import { Button } from './button';
import { UserResponse } from '@/lib/usersApi';

interface DeleteUserDialogProps {
  user: UserResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function DeleteUserDialog({ 
  user, 
  isOpen, 
  onClose, 
  onConfirm, 
  isLoading = false 
}: DeleteUserDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </div>
          <DialogDescription className="text-left">
            Êtes-vous sûr de vouloir supprimer l'utilisateur{' '}
            <span className="font-semibold">{user?.name}</span> ?
            <br />
            Cette action est irréversible et supprimera toutes les données
            associées à cet utilisateur.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? 'Suppression...' : 'Supprimer'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

interface UserActionDialogProps {
  user: UserResponse | null;
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
  description?: string;
}

export function UserActionDialog({ 
  user, 
  isOpen, 
  onClose, 
  children, 
  title, 
  description 
}: UserActionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-left">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="py-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
}