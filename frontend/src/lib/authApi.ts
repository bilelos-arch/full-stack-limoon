import axios from 'axios';
import { User } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

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

  constructor() {
    // Intercepteur de réponse pour gérer les erreurs 401
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Déclencher la déconnexion globale
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }

  private handleUnauthorized() {
    console.log('authApi.handleUnauthorized: 401 détecté, déclenchement déconnexion globale');
    // Importer le store ici pour éviter les dépendances circulaires
    import('@/stores/authStore').then(({ useAuthStore }) => {
      const { logout } = useAuthStore.getState();
      logout();
      // ⚠️ REMOVED: La redirection sera gérée par les composants
    });
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/login', data);
    return response.data;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/register', data);
    return response.data;
  }

  async logout(): Promise<AuthResponse> {
    try {
      const response = await this.api.post<AuthResponse>('/auth/logout');
      return response.data;
    } catch (error: any) {
      // If logout fails with 401, it means the token is already invalid
      // This is expected behavior, so we don't throw the error
      if (error.response?.status === 401) {
        console.warn('Logout: Token already invalid (401), proceeding with local logout');
        return { message: 'Logout successful' };
      }
      throw error;
    }
  }

  async refreshToken(): Promise<AuthResponse> {
    const response = await this.api.post<AuthResponse>('/auth/refresh');
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.api.get<User>('/users/profile');
    console.log('authApi.getProfile response:', response.data);
    return response.data;
  }
}

export const authApi = new AuthApi();