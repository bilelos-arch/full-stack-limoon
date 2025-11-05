import axios from 'axios';

export interface Histoire {
  _id: string;
  templateId: string | { _id: string };
  userId: string;
  variables: Record<string, any>; // Changed from Record<string, string> to match backend
  previewUrls?: string[];
  pdfUrl?: string;
  generatedPdfUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHistoireDto {
  templateId: string;
  variables: Record<string, any>; // Changed from Record<string, string> to match backend
}

export interface GenerateHistoireDto {
  templateId: string;
  variables: Record<string, any>; // Changed from Record<string, string> to match backend
}

export interface GenerateHistoireResponse {
  success: boolean;
  histoire: {
    _id: string;
    templateId: string;
    userId: string;
    variables: Record<string, any>; // Changed from Record<string, string> to match backend
    previewUrls?: string[];
    pdfUrl?: string;
    generatedPdfUrl?: string;
    createdAt: string;
    updatedAt: string;
  };
  processingSummary?: {
    uploadedImages: number;
    mappedVariables: string[];
    fileErrors?: string[];
  };
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class HistoireApi {
  private api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important pour les cookies HTTP-only
  });

  async generatePreview(templateId: string, variables: Record<string, string>): Promise<{ previewUrls: string[], pdfUrl: string, histoireId: string }> {
    const response = await this.api.post<{ previewUrls: string[], pdfUrl: string, histoireId: string }>('/histoires/preview', {
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
    console.log('API base URL:', this.api.defaults.baseURL);
    console.log('Full request URL:', `${this.api.defaults.baseURL}/histoires/generate`);
    console.log('Request data:', JSON.stringify(data, null, 2));

    try {
      const response = await this.api.post<GenerateHistoireResponse>('/histoires/generate', data);
      console.log('histoireApi.generateHistoire response status:', response.status);
      console.log('histoireApi.generateHistoire response headers:', response.headers);
      console.log('histoireApi.generateHistoire response data:', response.data);
      console.log('Response data type:', typeof response.data);
      console.log('Response data keys:', Object.keys(response.data || {}));
      return response.data;
    } catch (error) {
      console.error('histoireApi.generateHistoire error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as any;
        console.error('Error response:', axiosError.response?.data);
        console.error('Error status:', axiosError.response?.status);
        console.error('Error headers:', axiosError.response?.headers);
      }
      throw error;
    }
  }
}

export const histoireApi = new HistoireApi();