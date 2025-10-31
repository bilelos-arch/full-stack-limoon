import axios from 'axios';
import { User } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'user';
}

export interface AuthResponse {
  message: string;
}

class AuthApi {
  private api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important pour les cookies HTTP-only
  });

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/logout');
    return response.data;
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/refresh');
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<User>('/users/profile');
    return response.data;
  }
}

export const authApi = new AuthApi();