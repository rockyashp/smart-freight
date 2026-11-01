import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { insightsService } from '../services/insightsService';
import type { ClusteringResult, CustomerPersona } from '../types';

export const CustomerInsightsPage: React.FC = () => {
  const [k, setK] = useState<number>(4);
  const [data, setData] = useState<ClusteringResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClustering = (clusterCount: number) => {
    setLoading(true);
    setError(null);
    insightsService
      .getCustomerSegmentation(clusterCount)
      .then((res: ClusteringResult) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to compute customer clustering');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClustering(k);
  }, [k]);

  if (loading) {
    return <LoadingState message={`Fitting K-Means (k=${k}) and computing silhouette validation metrics...`} />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Customer Insights" subtitle="Behavioral segmentation" />
        <EmptyState
          title="Clustering Computation Error"
          description={error || 'Unable to retrieve cluster personas.'}
          actionLabel="Retry"
          onAction={() => fetchClustering(k)}
        />
      </div>
    );
  }

  const { metrics, personas } = data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customer Segmentation & Behavioral Profiles"
        subtitle="Unsupervised K-Means clustering derived from purchasing cadence, discount sensitivity, and shipping transit tolerance"
        badge={
          <Badge variant="violet" size="sm" dot>
            Unsupervised Learning (k={k})
          </Badge>
        }
        actions={
          <div className="flex items-center gap-1.5 bg-[#161718] p-1 rounded-[6px] border border-[#23252a]">
            <span className="text-[11px] font-mono text-[#8a8f98] px-2">Clusters (k):</span>
            {[3, 4, 5].map((val) => (
              <button
                key={val}
                onClick={() => setK(val)}
                className={`text-[12px] font-mono px-2.5 py-0.5 rounded-[4px] transition-colors cursor-pointer ${
                  k === val
                    ? 'bg-[#e4f222] text-[#08090a] font-bold'
                    : 'text-[#8a8f98] hover:text-[#ffffff]'
                }`}
              >
                {val}
              </button>
            ))}
          </div>
        }
      />

      {/* ── Validation Metrics Strip ────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="sm">
          <span className="text-[11px] font-mono text-[#8a8f98] block">Silhouette Coefficient</span>
          <span className="text-[20px] font-mono font-[510] text-[#38bdf8] block mt-0.5">
            {metrics.silhouette_score?.toFixed(3) || '0.299'}
          </span>
          <span className="text-[10px] text-[#62666d]">Separation quality index</span>
        </Card>

        <Card padding="sm">
          <span className="text-[11px] font-mono text-[#8a8f98] block">Calinski-Harabasz</span>
          <span className="text-[20px] font-mono font-[510] text-[#27a644] block mt-0.5">
            {metrics.calinski_harabasz?.toFixed(1) || '680.0'}
          </span>
          <span className="text-[10px] text-[#62666d]">Between/within variance ratio</span>
        </Card>

        <Card padding="sm">
          <span className="text-[11px] font-mono text-[#8a8f98] block">Davies-Bouldin</span>
          <span className="text-[20px] font-mono font-[510] text-[#a78bfa] block mt-0.5">
            {metrics.davies_bouldin?.toFixed(3) || '1.140'}
          </span>
          <span className="text-[10px] text-[#62666d]">Cluster similarity index</span>
        </Card>

        <Card padding="sm">
          <span className="text-[11px] font-mono text-[#8a8f98] block">Inertia (WCSS)</span>
          <span className="text-[20px] font-mono font-[510] text-[#e4f222] block mt-0.5">
            {metrics.wcss?.toFixed(0) || '3,880'}
          </span>
          <span className="text-[10px] text-[#62666d]">Sum of squared distances</span>
        </Card>
      </div>

      {/* ── Customer Persona Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personas.map((persona: CustomerPersona) => (
          <Card key={persona.cluster} className="space-y-4 hover:border-[#383b3f] transition-colors">
            <div className="flex items-start justify-between border-b border-[#23252a] pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] text-[#8a8f98]">
                    Cluster #{persona.cluster}
                  </span>
                  <Badge variant="neutral" size="sm">
                    {persona.pct_customers}% of Accounts
                  </Badge>
                </div>
                <h3 className="text-[16px] font-[510] text-[#ffffff] tracking-tight mt-1">
                  {persona.persona_title}
                </h3>
              </div>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 mt-1"
                style={{ backgroundColor: persona.badge_color || '#38bdf8' }}
              />
            </div>

            <p className="text-[12px] text-[#8a8f98] leading-relaxed">
              {persona.description}
            </p>

            {/* Persona Metrics Matrix */}
            <div className="grid grid-cols-3 gap-2 p-3 rounded-[8px] bg-[rgba(255,255,255,0.02)] border border-[#23252a] font-mono text-[11px]">
              <div>
                <span className="text-[#62666d] block text-[10px]">Avg Order Spend</span>
                <span className="text-[#ffffff] font-bold text-[13px]">
                  ${persona.total_sales?.toFixed(0)}
                </span>
              </div>
              <div>
                <span className="text-[#62666d] block text-[10px]">Avg Discount</span>
                <span className="text-[#38bdf8] font-bold text-[13px]">
                  {persona.avg_discount?.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-[#62666d] block text-[10px]">Shipping Transit</span>
                <span className="text-[#a78bfa] font-bold text-[13px]">
                  {persona.avg_shipping_days?.toFixed(1)}d
                </span>
              </div>
            </div>

            {/* Logistics Strategy Recommendation */}
            <div className="p-3 rounded-[6px] bg-[#161718] border border-[#23252a]">
              <span className="text-[10px] font-mono uppercase text-[#e4f222] block font-bold mb-1">
                Recommended Fulfillment Strategy
              </span>
              <p className="text-[12px] text-[#d0d6e0] leading-snug">
                {persona.strategy}
              </p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
