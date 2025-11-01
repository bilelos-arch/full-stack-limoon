import axios from 'axios';

export interface Histoire {
  _id: string;
  templateId: string | { _id: string };
  userId: string;
  variables: Record<string, string>;
  previewUrls?: string[];
  pdfUrl?: string;
  generatedPdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHistoireDto {
  templateId: string;
  variables: Record<string, string>;
}

export interface GenerateHistoireDto {
  templateId: string;
  variables: Record<string, string>;
}

export interface GenerateHistoireResponse {
  _id: string;
  templateId: string;
  userId: string;
  variables: Record<string, string>;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class HistoireApi {
  private api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important pour les cookies HTTP-only
  });

  async generatePreview(templateId: string, variables: Record<string, string>): Promise<{ previewUrls: string[] }> {
    const response = await this.api.post<{ previewUrls: string[] }>('/histoires/preview', {
      templateId,
      variables,
    });
    return response.data;
  }

  async getUserHistoires(userId: string): Promise<Histoire[]> {
    const response = await this.api.get<Histoire[]>(`/histoires`);
    return response.data;
  }

  async getHistoire(histoireId: string): Promise<Histoire> {
    const response = await this.api.get<Histoire>(`/histoires/${histoireId}`);
    return response.data;
  }

  async generateHistoire(data: GenerateHistoireDto): Promise<GenerateHistoireResponse> {
    console.log('histoireApi.generateHistoire called with:', data);
    const response = await this.api.post<GenerateHistoireResponse>('/histoires/generer', data);
    console.log('histoireApi.generateHistoire response:', response.data);
    return response.data;
  }
}

export const histoireApi = new HistoireApi();