import { api } from './api';
import type { ClusteringResult, AssociationRulesResult } from '../types';

export const insightsService = {
  // Run customer segmentation (K-Means clustering)
  async getCustomerSegmentation(k: number = 4, algorithm: string = 'kmeans'): Promise<ClusteringResult> {
    const response = await api.get<ClusteringResult>('/api/academic/clustering/run', {
      params: { k, algorithm },
    });
    return response.data;
  },

  // Mine product association rules (Apriori algorithm)
  async getAssociationRules(minSupport: number = 0.01, minConfidence: number = 0.15): Promise<AssociationRulesResult> {
    const response = await api.get<AssociationRulesResult>('/api/academic/association-rules/run', {
      params: {
        min_support: minSupport,
        min_confidence: minConfidence,
        item_level: 'Category Name',
      },
    });
    return response.data;
  },
};

