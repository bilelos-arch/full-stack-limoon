//frontend/src/lib/templatesApi.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:10000';

export interface EditorElement {
  id: string;
  templateId: string;
  type: 'text' | 'image';
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  textContent?: string;
  font?: string;
  fontSize?: number;
  fontStyle?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikethrough?: boolean;
  };
  googleFont?: string;
  color?: string;
  backgroundColor?: string;
  alignment?: 'left' | 'center' | 'right';
  variableName?: string;
  variables?: string[];
  defaultValues?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  _id: string;
  title: string;
  description: string;
  category: 'Contes et aventures imaginaires' | 'Héros du quotidien' | 'Histoires avec des animaux' | 'Histoires éducatives' | 'Valeurs et développement personnel' | 'Vie quotidienne et école' | 'Fêtes et occasions spéciales' | 'Exploration et science-fiction' | 'Culture et traditions' | 'Histoires du soir';
  ageRange: '3 ans - 5 ans' | '6 ans - 8 ans' | '9 ans - 11 ans' | '12 ans - 15 ans';
  gender: 'boy' | 'girl' | 'unisex';
  language: 'Français' | 'Anglais' | 'Arabe';
  isPublished: boolean;
  pdfPath: string;
  coverPath: string;
  pageCount?: number;
  dimensions?: {
    width: number;
    height: number;
  };
  variables: string[];
  rating?: number;
  isPopular?: boolean;
  isRecent?: boolean;
  createdAt: string;
  updatedAt: string;
  pdfUrl?: string; // For generated preview PDFs
  previewUrls?: string[]; // Preview images for templates
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
    console.log('=== GET TEMPLATE DEBUG ===');
    console.log('Input id:', id);
    console.log('id type:', typeof id);
    console.log('id length:', id ? id.length : 'null/undefined');
    console.log('id is null:', id === null);
    console.log('id is undefined:', id === undefined);
    console.log('id is empty string:', id === '');
    console.log('id matches ObjectId regex:', id ? /^[a-f\d]{24}$/i.test(id) : false);
    console.log('id contains only valid hex chars:', id ? /^[a-fA-F0-9]+$/.test(id) : false);
    console.log('id char codes:', id ? [...id].map(c => c.charCodeAt(0)) : []);
    console.log('Full URL being requested:', `${this.api.defaults.baseURL}/templates/${id}`);
    try {
      const response = await this.api.get<Template>(`/templates/${id}`);
      console.log('getTemplate response status:', response.status);
      console.log('getTemplate response data:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('getTemplate error:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      throw error;
    }
  }

  async getEditorElements(templateId: string): Promise<EditorElement[]> {
    const response = await this.api.get<EditorElement[]>(`/templates/${templateId}/elements/public/${templateId}`);
    return response.data;
  }

  async generatePreview(templateId: string, variables: Record<string, string>): Promise<{ previewUrls: string[], pdfUrl: string, histoireId: string }> {
    const response = await this.api.post<{ previewUrls: string[], pdfUrl: string, histoireId: string }>('/templates/preview', {
      templateId,
      variables,
    });
    return response.data;
  }
}

export const templatesApi = new TemplatesApi();