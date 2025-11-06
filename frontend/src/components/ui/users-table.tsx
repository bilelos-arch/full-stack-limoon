"use client";

import React from 'react';
import { MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './table';
import { Button } from './button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { UserResponse } from '@/lib/usersApi';
import { UserStatusBadge, UserRoleBadge } from './user-badges';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface UsersTableProps {
  users: UserResponse[];
  onEditUser: (user: UserResponse) => void;
  onDeleteUser: (user: UserResponse) => void;
  onViewUser: (user: UserResponse) => void;
  isLoading?: boolean;
}

export function UsersTable({ 
  users, 
  onEditUser, 
  onDeleteUser, 
  onViewUser, 
  isLoading = false 
}: UsersTableProps) {
  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { 
        addSuffix: true, 
        locale: fr 
      });
    } catch {
      return 'Date invalide';
    }
  };

  const formatDateTime = (date: string) => {
    try {
      return new Date(date).toLocaleString('fr-FR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Date invalide';
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Utilisateur</TableHead>
              <TableHead>Rôle</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Créé le</TableHead>
              <TableHead>Dernière connexion</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                {Array.from({ length: 6 }).map((_, j) => (
                  <TableCell key={j}>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">
          Aucun utilisateur trouvé.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-white dark:bg-gray-800 dark:border-gray-700">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">Utilisateur</TableHead>
            <TableHead>Rôle</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Créé le</TableHead>
            <TableHead>Dernière connexion</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <div>
                  <div className="font-medium">{user.name}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {user.email}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <UserRoleBadge role={user.role} />
              </TableCell>
              <TableCell>
                <UserStatusBadge status={user.status} />
              </TableCell>
              <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                <div title={formatDateTime(user.createdAt)}>
                  {formatDate(user.createdAt)}
                </div>
              </TableCell>
              <TableCell className="text-sm text-gray-500 dark:text-gray-400">
                {user.lastLogin ? (
                  <div title={formatDateTime(user.lastLogin)}>
                    {formatDate(user.lastLogin)}
                  </div>
                ) : (
                  <span className="italic">Jamais</span>
                )}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Actions</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onViewUser(user)}>
                      <Eye className="mr-2 h-4 w-4" />
                      Voir
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditUser(user)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Éditer
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteUser(user)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}