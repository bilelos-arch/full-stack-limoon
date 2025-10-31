import axios from 'axios';

export interface Histoire {
  _id: string;
  templateId: string;
  userId: string;
  variables: Record<string, string>;
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
  message: string;
  generatedPdfUrl: string;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

class HistoireApi {
  private api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true, // Important pour les cookies HTTP-only
  });

  async getUserHistoires(userId: string): Promise<Histoire[]> {
    const response = await this.api.get<Histoire[]>(`/histoire/user/${userId}`);
    return response.data;
  }

  async getHistoire(histoireId: string): Promise<Histoire> {
    const response = await this.api.get<Histoire>(`/histoire/${histoireId}`);
    return response.data;
  }

  async generateHistoire(data: GenerateHistoireDto): Promise<GenerateHistoireResponse> {
    const response = await this.api.post<GenerateHistoireResponse>('/histoire/generate', data);
    return response.data;
  }
}

export const histoireApi = new HistoireApi();