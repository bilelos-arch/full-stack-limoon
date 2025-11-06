import { Badge } from './badge';
import { UserResponse } from '@/lib/usersApi';
import { cn } from '@/lib/utils';

interface UserStatusBadgeProps {
  status: UserResponse['status'];
  className?: string;
}

interface UserRoleBadgeProps {
  role: UserResponse['role'];
  className?: string;
}

export function UserStatusBadge({ status, className }: UserStatusBadgeProps) {
  const getStatusConfig = (status: UserResponse['status']) => {
    switch (status) {
      case 'active':
        return {
          variant: 'default' as const,
          label: 'Actif',
          className: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
        };
      case 'inactive':
        return {
          variant: 'secondary' as const,
          label: 'Inactif',
          className: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800'
        };
      case 'suspended':
        return {
          variant: 'destructive' as const,
          label: 'Suspendu',
          className: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
        };
      default:
        return {
          variant: 'secondary' as const,
          label: status,
          className: ''
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

export function UserRoleBadge({ role, className }: UserRoleBadgeProps) {
  const getRoleConfig = (role: UserResponse['role']) => {
    switch (role) {
      case 'admin':
        return {
          variant: 'destructive' as const,
          label: 'Administrateur',
          className: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
        };
      case 'user':
        return {
          variant: 'secondary' as const,
          label: 'Utilisateur',
          className: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
        };
      default:
        return {
          variant: 'secondary' as const,
          label: role,
          className: ''
        };
    }
  };

  const config = getRoleConfig(role);

  return (
    <Badge 
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}