import { api } from './api';
import type { DashboardData, PredictionHistoryItem } from '../types';

export const analyticsService = {
  // Fetch real aggregated prediction KPIs, recent history, and model metadata
  async getDashboardData(): Promise<DashboardData> {
    const response = await api.get<DashboardData>('/api/dashboard');
    return response.data;
  },

  // Fetch full prediction history
  async getHistory(limit: number = 100): Promise<{ history: PredictionHistoryItem[]; total: number }> {
    const response = await api.get<{ history: PredictionHistoryItem[]; total: number }>('/api/history', {
      params: { limit },
    });
    return response.data;
  },

  // Export prediction history CSV URL
  getHistoryExportCsvUrl(): string {
    return '/dashboard/export_csv';
  },

  // Fetch regression benchmark suite
  async getRegressionBenchmark(): Promise<any> {
    const response = await api.get('/api/academic/regression/benchmark');
    return response.data;
  },

  // Fetch classification benchmark matrix
  async getClassificationBenchmark(): Promise<any> {
    const response = await api.get('/api/academic/classification/benchmark');
    return response.data;
  },

  // System health check
  async getHealth(): Promise<{ status: string; checks: Record<string, any> }> {
    const response = await api.get('/health');
    return response.data;
  },
};

