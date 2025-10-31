import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface Template {
  _id: string;
  title: string;
  description: string;
  category: string;
  ageRange: string;
  gender: string;
  language: string;
  isPublished: boolean;
  pdfPath: string;
  coverPath: string;
  pageCount: number;
  dimensions: {
    width: number;
    height: number;
  };
  rating?: number;
  isPopular?: boolean;
  isRecent?: boolean;
  createdAt: string;
  updatedAt: string;
}

class TemplatesApi {
  private api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
  });

  async searchTemplates(query: string, limit: number = 10): Promise<Template[]> {
    const response = await this.api.get<Template[]>('/templates/search', {
      params: { q: query, limit },
    });
    return response.data;
  }

  async getTemplates(params?: {
    category?: string;
    gender?: string;
    ageRange?: string;
    isPublished?: string;
    language?: string;
  }): Promise<Template[]> {
    const response = await this.api.get<Template[]>('/templates', { params });
    return response.data;
  }

  async getAllTemplates(): Promise<Template[]> {
    return this.getTemplates();
  }

  async getTemplate(id: string): Promise<Template> {
    const response = await this.api.get<Template>(`/templates/${id}`);
    return response.data;
  }
}

export const templatesApi = new TemplatesApi();