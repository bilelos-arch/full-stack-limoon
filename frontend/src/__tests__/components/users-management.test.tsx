import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { UsersTable } from '../components/ui/users-table';
import { UserResponse } from '../lib/usersApi';
import { UserStatusBadge, UserRoleBadge } from '../components/ui/user-badges';

// Mock des données
const mockUsers: UserResponse[] = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    storiesCount: 5
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'inactive',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    lastLogin: '2024-01-15T10:30:00Z',
    storiesCount: 2
  }
];

// Mock des handlers
const mockHandlers = {
  onEditUser: jest.fn(),
  onDeleteUser: jest.fn(),
  onViewUser: jest.fn()
};

describe('UsersTable', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rend le tableau avec les données utilisateur', () => {
    render(
      <UsersTable
        users={mockUsers}
        onEditUser={mockHandlers.onEditUser}
        onDeleteUser={mockHandlers.onDeleteUser}
        onViewUser={mockHandlers.onViewUser}
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    expect(screen.getByText('jane@example.com')).toBeInTheDocument();
  });

  it('affiche un état de chargement', () => {
    render(
      <UsersTable
        users={[]}
        onEditUser={mockHandlers.onEditUser}
        onDeleteUser={mockHandlers.onDeleteUser}
        onViewUser={mockHandlers.onViewUser}
        isLoading={true}
      />
    );

    expect(screen.getByText('Aucun utilisateur trouvé')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('skeleton-row')).toHaveLength(5);
  });

  it('affiche un message quand aucun utilisateur n\'est trouvé', () => {
    render(
      <UsersTable
        users={[]}
        onEditUser={mockHandlers.onEditUser}
        onDeleteUser={mockHandlers.onDeleteUser}
        onViewUser={mockHandlers.onViewUser}
      />
    );

    expect(screen.getByText('Aucun utilisateur trouvé')).toBeInTheDocument();
  });
});

describe('UserStatusBadge', () => {
  it('affiche le bon statut pour chaque état', () => {
    const { rerender } = render(
      <UserStatusBadge status="active" />
    );
    expect(screen.getByText('Actif')).toBeInTheDocument();

    rerender(<UserStatusBadge status="inactive" />);
    expect(screen.getByText('Inactif')).toBeInTheDocument();

    rerender(<UserStatusBadge status="suspended" />);
    expect(screen.getByText('Suspendu')).toBeInTheDocument();
  });
});

describe('UserRoleBadge', () => {
  it('affiche le bon rôle pour admin', () => {
    render(<UserRoleBadge role="admin" />);
    expect(screen.getByText('Administrateur')).toBeInTheDocument();
  });

  it('affiche le bon rôle pour user', () => {
    render(<UserRoleBadge role="user" />);
    expect(screen.getByText('Utilisateur')).toBeInTheDocument();
  });
});