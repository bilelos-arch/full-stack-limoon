import { useState, useEffect, useCallback } from 'react';
import {
    usersApi,
    UserResponse,
    PaginatedUsersResponse,
    CreateUserData,
    UpdateUserData,
    QueryUsersParams
} from '@/lib/usersApi';

interface UseUsersReturn {
  users: UserResponse[];
  pagination: PaginatedUsersResponse['pagination'] | null;
  isLoading: boolean;
  error: string | null;
  // Data fetching
  fetchUsers: (params?: QueryUsersParams) => Promise<void>;
  refreshUsers: () => Promise<void>;
  // CRUD operations
  createUser: (userData: CreateUserData) => Promise<UserResponse>;
  updateUser: (id: string, userData: UpdateUserData) => Promise<UserResponse>;
  deleteUser: (id: string) => Promise<void>;
  // Utility
  clearError: () => void;
}

export function useUsers(initialParams?: QueryUsersParams): UseUsersReturn {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [pagination, setPagination] = useState<PaginatedUsersResponse['pagination'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<QueryUsersParams>(initialParams || {
    page: 1,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  const fetchUsers = useCallback(async (newParams?: QueryUsersParams) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const searchParams = newParams ? { ...params, ...newParams } : params;
      const response = await usersApi.getUsers(searchParams);
      
      setUsers(response.users);
      setPagination(response.pagination);
      setParams(searchParams);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des utilisateurs');
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  const refreshUsers = useCallback(() => {
    return fetchUsers();
  }, [fetchUsers]);

  const createUser = useCallback(async (userData: CreateUserData): Promise<UserResponse> => {
    setError(null);
    
    try {
      const newUser = await usersApi.createUser(userData);
      // Rafraîchir la liste pour inclure le nouvel utilisateur
      await fetchUsers();
      return newUser;
    } catch (err) {
      console.error('Error creating user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'utilisateur';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [fetchUsers]);

  const updateUser = useCallback(async (id: string, userData: UpdateUserData): Promise<UserResponse> => {
    setError(null);
    
    try {
      const updatedUser = await usersApi.updateUser(id, userData);
      // Mettre à jour la liste localement pour une meilleure UX
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user._id === id ? updatedUser : user
        )
      );
      return updatedUser;
    } catch (err) {
      console.error('Error updating user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'utilisateur';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  const deleteUser = useCallback(async (id: string): Promise<void> => {
    setError(null);
    
    try {
      await usersApi.deleteUser(id);
      // Supprimer l'utilisateur de la liste localement
      setUsers(prevUsers => prevUsers.filter(user => user._id !== id));
      
      // Ajuster la pagination si nécessaire
      if (pagination && pagination.total > 0) {
        setPagination(prev => prev ? {
          ...prev,
          total: prev.total - 1
        } : null);
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'utilisateur';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  }, [pagination]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Charger les données au montage
  useEffect(() => {
    fetchUsers();
  }, []); // Ne s'exécute qu'au montage

  return {
    users,
    pagination,
    isLoading,
    error,
    fetchUsers,
    refreshUsers,
    createUser,
    updateUser,
    deleteUser,
    clearError
  };
}