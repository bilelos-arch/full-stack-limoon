"use client";

import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from './input';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  sortOrder: string;
  onSortOrderChange: (order: string) => void;
  isLoading?: boolean;
}

export function UserFilters({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedStatus,
  onStatusChange,
  sortBy,
  onSortChange,
  sortOrder,
  onSortOrderChange,
  isLoading = false
}: SearchFiltersProps) {
  const hasActiveFilters = searchQuery || selectedRole !== 'all' || selectedStatus !== 'all';

  const clearFilters = () => {
    onSearchChange('');
    onRoleChange('all');
    onStatusChange('all');
    onSortChange('createdAt');
    onSortOrderChange('desc');
  };

  return (
    <div className="space-y-4">
      {/* Barre de recherche principale */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
          disabled={isLoading}
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => onSearchChange('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            disabled={isLoading}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filtres et tri */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtres:
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedRole} onValueChange={onRoleChange} disabled={isLoading}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">Utilisateur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedStatus} onValueChange={onStatusChange} disabled={isLoading}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="active">Actif</SelectItem>
              <SelectItem value="inactive">Inactif</SelectItem>
              <SelectItem value="suspended">Suspendu</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={onSortChange} disabled={isLoading}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Nom</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="role">Rôle</SelectItem>
              <SelectItem value="status">Statut</SelectItem>
              <SelectItem value="createdAt">Date de création</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={onSortOrderChange} disabled={isLoading}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Ordre" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asc">Croissant</SelectItem>
              <SelectItem value="desc">Décroissant</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="h-4 w-4 mr-1" />
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
}