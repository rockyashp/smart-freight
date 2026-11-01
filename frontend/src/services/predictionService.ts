import { api } from './api';
import type { DropdownHierarchy, PredictionInput, PredictionResult } from '../types';

export const predictionService = {
  // Fetch cascading hierarchy for markets, regions, countries, states, categories
  async getHierarchy(): Promise<DropdownHierarchy> {
    const response = await api.get<DropdownHierarchy>('/api/hierarchy');
    return response.data;
  },

  // Submit single shipment prediction
  async predictSingle(input: PredictionInput): Promise<PredictionResult> {
    const response = await api.post<PredictionResult>('/api/predict', input);
    return response.data;
  },

  // Submit batch prediction CSV file
  async predictBatch(file: File): Promise<{
    success: boolean;
    total: number;
    preview: Record<string, any>[];
    columns: string[];
  }> {
    const formData = new FormData();
    formData.append('batch_file', file);
    const response = await api.post('/api/batch_predict', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Download sample CSV template URL
  getSampleCsvUrl(): string {
    return '/batch_predict/sample';
  },

  // Download enriched batch predictions URL
  getBatchDownloadUrl(): string {
    return '/batch_predict/download';
  },
};

