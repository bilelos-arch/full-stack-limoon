import axios from 'axios';

export interface UserResponse {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  storiesCount?: number;
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

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'user';
  status?: 'active' | 'inactive' | 'suspended';
}

export interface QueryUsersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'role' | 'status' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  role?: 'admin' | 'user';
  status?: 'active' | 'inactive' | 'suspended';
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

class UsersApi {
  private api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important pour les cookies HTTP-only
  });

  async getUsers(params?: QueryUsersParams): Promise<PaginatedUsersResponse> {
    const response = await this.api.get<PaginatedUsersResponse>('/users', { params });
    return response.data;
  }

  async getUserById(id: string): Promise<UserResponse> {
    const response = await this.api.get<UserResponse>(`/users/${id}`);
    return response.data;
  }

  async createUser(userData: CreateUserData): Promise<UserResponse> {
    const response = await this.api.post<UserResponse>('/users', userData);
    return response.data;
  }

  async updateUser(id: string, userData: UpdateUserData): Promise<UserResponse> {
    const response = await this.api.put<UserResponse>(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.api.delete(`/users/${id}`);
  }
}

export const usersApi = new UsersApi();