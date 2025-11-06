"use client";

import React, { useState } from 'react';
import { Plus, Users, AlertCircle } from 'lucide-react';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useTokenRefresh } from '@/hooks/useTokenRefresh';
import { useUsers } from '@/hooks/useUsers';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { UsersTable } from '@/components/ui/users-table';
import { UserFilters } from '@/components/ui/user-filters';
import { UserPagination } from '@/components/ui/user-pagination';
import { DeleteUserDialog, UserActionDialog } from '@/components/ui/user-dialogs';
import { CreateUserForm, EditUserForm } from '@/components/user-forms';
import { UserResponse } from '@/lib/usersApi';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function UsersManagementPage() {
  const { user, isAuthenticated, checkAuth } = useAuthStore();
  const router = useRouter();
  const {
    users,
    pagination,
    isLoading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError
  } = useUsers();

  // États pour les filtres et la recherche
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // États pour les modals
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Utiliser le hook de rafraîchissement des tokens
  useTokenRefresh();

  // Vérifier l'authentification et les permissions admin
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

  // Charger les utilisateurs avec les filtres actuels
  const loadUsers = (newPage?: number) => {
    const params = {
      page: newPage || 1,
      limit: pagination?.limit || 10,
      search: searchQuery || undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      role: selectedRole !== 'all' ? selectedRole as any : undefined,
      status: selectedStatus !== 'all' ? selectedStatus as any : undefined,
    };
    fetchUsers(params);
  };

  // Gestionnaires d'événements
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    loadUsers(1);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
    loadUsers(1);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    loadUsers(1);
  };

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    loadUsers(1);
  };

  const handleSortOrderChange = (order: string) => {
    setSortOrder(order);
    loadUsers(1);
  };

  const handlePageChange = (page: number) => {
    loadUsers(page);
  };

  const handleLimitChange = (limit: number) => {
    fetchUsers({ 
      page: 1, 
      limit, 
      search: searchQuery || undefined,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      role: selectedRole !== 'all' ? selectedRole as any : undefined,
      status: selectedStatus !== 'all' ? selectedStatus as any : undefined,
    });
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setShowCreateForm(true);
  };

  const handleEditUser = (user: UserResponse) => {
    setSelectedUser(user);
    setShowEditForm(true);
  };

  const handleViewUser = (user: UserResponse) => {
    setSelectedUser(user);
    setShowViewDialog(true);
  };

  const handleDeleteUser = (user: UserResponse) => {
    setSelectedUser(user);
    setShowDeleteDialog(true);
  };

  const handleCreateSubmit = async (userData: any) => {
    setIsSubmitting(true);
    try {
      await createUser(userData);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Erreur lors de la création:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditSubmit = async (userData: any) => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      await updateUser(selectedUser._id, userData);
      setShowEditForm(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      await deleteUser(selectedUser._id);
      setShowDeleteDialog(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Affichage pendant la vérification de l'authentification
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100 mx-auto"></div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Gestion des Utilisateurs
            </h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Gérer les comptes utilisateurs et leurs permissions
            </p>
          </div>
          <Button onClick={handleCreateUser} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total utilisateurs
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {pagination?.total || 0}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Alertes d'erreur */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {error}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearError}
                className="ml-2"
              >
                Fermer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Filtres et recherche */}
        <Card className="p-6">
          <UserFilters
            searchQuery={searchQuery}
            onSearchChange={handleSearchChange}
            selectedRole={selectedRole}
            onRoleChange={handleRoleChange}
            selectedStatus={selectedStatus}
            onStatusChange={handleStatusChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            sortOrder={sortOrder}
            onSortOrderChange={handleSortOrderChange}
            isLoading={isLoading}
          />
        </Card>

        {/* Tableau des utilisateurs */}
        <Card className="p-6">
          <UsersTable
            users={users}
            onEditUser={handleEditUser}
            onDeleteUser={handleDeleteUser}
            onViewUser={handleViewUser}
            isLoading={isLoading}
          />
        </Card>

        {/* Pagination */}
        {pagination && (
          <UserPagination
            pagination={pagination}
            onPageChange={handlePageChange}
            onLimitChange={handleLimitChange}
            isLoading={isLoading}
          />
        )}

        {/* Modal de création */}
        {showCreateForm && (
          <UserActionDialog
            user={null}
            isOpen={showCreateForm}
            onClose={() => setShowCreateForm(false)}
            title="Créer un nouvel utilisateur"
            description="Remplissez les informations pour créer un nouveau compte utilisateur."
          >
            <CreateUserForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setShowCreateForm(false)}
              isLoading={isSubmitting}
            />
          </UserActionDialog>
        )}

        {/* Modal d'édition */}
        {showEditForm && selectedUser && (
          <UserActionDialog
            user={selectedUser}
            isOpen={showEditForm}
            onClose={() => setShowEditForm(false)}
            title="Éditer l'utilisateur"
            description={`Modification des informations de ${selectedUser.name}`}
          >
            <EditUserForm
              user={selectedUser}
              onSubmit={handleEditSubmit}
              onCancel={() => setShowEditForm(false)}
              isLoading={isSubmitting}
            />
          </UserActionDialog>
        )}

        {/* Modal de visualisation */}
        {showViewDialog && selectedUser && (
          <UserActionDialog
            user={selectedUser}
            isOpen={showViewDialog}
            onClose={() => setShowViewDialog(false)}
            title="Détails de l'utilisateur"
            description={`Informations complètes de ${selectedUser.name}`}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Nom complet
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    {selectedUser.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Email
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    {selectedUser.email}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Rôle
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    {selectedUser.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Statut
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    {selectedUser.status === 'active' ? 'Actif' : 
                     selectedUser.status === 'inactive' ? 'Inactif' : 'Suspendu'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date de création
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    {format(new Date(selectedUser.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Dernière connexion
                  </label>
                  <p className="mt-1 text-gray-900 dark:text-gray-100">
                    {selectedUser.lastLogin 
                      ? format(new Date(selectedUser.lastLogin), 'dd MMMM yyyy à HH:mm', { locale: fr })
                      : 'Jamais'}
                  </p>
                </div>
              </div>
            </div>
          </UserActionDialog>
        )}

        {/* Modal de confirmation de suppression */}
        <DeleteUserDialog
          user={selectedUser}
          isOpen={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={handleDeleteConfirm}
          isLoading={isSubmitting}
        />
      </div>
    </div>
  );
}