"use client";

import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './button';
import { PaginatedUsersResponse } from '@/lib/usersApi';

interface PaginationProps {
  pagination: PaginatedUsersResponse['pagination'];
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}

export function UserPagination({ 
  pagination, 
  onPageChange, 
  onLimitChange, 
  isLoading = false 
}: PaginationProps) {
  const { page, limit, total, totalPages, hasNext, hasPrev } = pagination;

  // Générer les numéros de page à afficher
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5; // Nombre max de boutons de page à afficher
    
    if (totalPages <= maxVisible) {
      // Afficher toutes les pages si ≤ 5
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Logique pour afficher les pages avec ellipses
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1, '...');
        for (let i = page - 1; i <= page + 1; i++) {
          pages.push(i);
        }
        pages.push('...', totalPages);
      }
    }
    
    return pages;
  };

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between space-x-2 py-4">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Affichage de{' '}
          <span className="font-medium">
            {((page - 1) * limit) + 1}
          </span>{' '}
          à{' '}
          <span className="font-medium">
            {Math.min(page * limit, total)}
          </span>{' '}
          sur{' '}
          <span className="font-medium">{total}</span> résultat{total > 1 ? 's' : ''}
        </p>
        
        <select
          value={limit}
          onChange={(e) => onLimitChange(Number(e.target.value))}
          disabled={isLoading}
          className="ml-4 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-2 py-1 text-sm"
        >
          <option value={5}>5 par page</option>
          <option value={10}>10 par page</option>
          <option value={25}>25 par page</option>
          <option value={50}>50 par page</option>
        </select>
      </div>

      <div className="flex items-center space-x-1">
        {/* Premier */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(1)}
          disabled={!hasPrev || isLoading}
          aria-label="Première page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Précédent */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrev || isLoading}
          aria-label="Page précédente"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Numéros de page */}
        {getPageNumbers().map((pageNum, index) => (
          <React.Fragment key={index}>
            {pageNum === '...' ? (
              <span className="px-2 text-gray-500">...</span>
            ) : (
              <Button
                variant={pageNum === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum as number)}
                disabled={isLoading}
                aria-label={`Page ${pageNum}`}
              >
                {pageNum}
              </Button>
            )}
          </React.Fragment>
        ))}

        {/* Suivant */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNext || isLoading}
          aria-label="Page suivante"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Dernier */}
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNext || isLoading}
          aria-label="Dernière page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}