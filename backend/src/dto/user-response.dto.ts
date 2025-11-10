import { User } from '../user.schema';

export interface UserResponse {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  birthDate?: Date;
  country?: string;
  city?: string;
  settings: {
    language: string;
    theme: string;
    notifications: boolean;
  };
  storyHistory: {
    id: string;
    title: string;
    createdAt: Date;
    category: string;
    language: string;
    link: string;
  }[];
  purchaseHistory: {
    id: string;
    productName: string;
    price: number;
    date: Date;
    paymentMethod: string;
    status: string;
    invoiceUrl: string;
  }[];
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

export interface PaginatedUsersResponse {
  users: UserResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}