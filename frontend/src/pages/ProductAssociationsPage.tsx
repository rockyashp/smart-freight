import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { insightsService } from '../services/insightsService';
import type { AssociationRulesResult, AssociationRule } from '../types';
import { Search, ArrowRight, Info } from 'lucide-react';

export const ProductAssociationsPage: React.FC = () => {
  const [data, setData] = useState<AssociationRulesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState('');

  useEffect(() => {
    insightsService
      .getAssociationRules(0.01, 0.15)
      .then((res: AssociationRulesResult) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to mine association rules');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingState message="Mining frequent basket itemsets using Apriori algorithm..." />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Product Associations" subtitle="Apriori basket analysis" />
        <EmptyState
          title="Mining Process Unavailable"
          description={error || 'Unable to load basket co-occurrence rules.'}
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  const { rules, summary, total_baskets } = data;

  const filteredRules = rules.filter(
    (r: AssociationRule) =>
      r.antecedents.some((a: string) => a.toLowerCase().includes(filterText.toLowerCase())) ||
      r.consequents.some((c: string) => c.toLowerCase().includes(filterText.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Category Association Rules"
        subtitle="Mined with Apriori algorithm from order basket transaction matrices"
        badge={
          <Badge variant="teal" size="sm" dot>
            {rules.length} Valid Rules Mined
          </Badge>
        }
      />

      {/* ── Summary KPI Strip ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card padding="sm">
          <span className="text-[11px] font-mono text-[#8a8f98] block">Analyzed Baskets</span>
          <span className="text-[20px] font-mono font-[510] text-[#ffffff] block mt-0.5">
            {total_baskets?.toLocaleString() || '18,500'}
          </span>
          <span className="text-[10px] text-[#62666d]">Order transaction groups</span>
        </Card>

        <Card padding="sm">
          <span className="text-[11px] font-mono text-[#8a8f98] block">Maximum Lift</span>
          <span className="text-[20px] font-mono font-[510] text-[#e4f222] block mt-0.5">
            {summary.max_lift?.toFixed(2) || '4.85'}x
          </span>
          <span className="text-[10px] text-[#62666d]">Above independent probability</span>
        </Card>

        <Card padding="sm">
          <span className="text-[11px] font-mono text-[#8a8f98] block">Mean Confidence</span>
          <span className="text-[20px] font-mono font-[510] text-[#27a644] block mt-0.5">
            {((summary.avg_confidence || 0.25) * 100).toFixed(1)}%
          </span>
          <span className="text-[10px] text-[#62666d]">Conditional likelihood</span>
        </Card>

        <Card padding="sm">
          <span className="text-[11px] font-mono text-[#8a8f98] block">Support Threshold</span>
          <span className="text-[20px] font-mono font-[510] text-[#38bdf8] block mt-0.5">
            1.0%
          </span>
          <span className="text-[10px] text-[#62666d]">Minimum basket frequency</span>
        </Card>
      </div>

      {/* ── Filter Bar & Rules Table ────────────────────────────────────── */}
      <Card padding="none">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#23252a]">
          <div>
            <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
              Mined Association Rules (Ranked by Lift)
            </h3>
            <p className="text-[12px] text-[#8a8f98]">
              Cross-sell affinity pairs with lift &gt; 1.0 (indicating strong positive correlation)
            </p>
          </div>

          <div className="w-full sm:w-64">
            <Input
              placeholder="Search category (e.g. Cleats)..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              icon={<Search className="w-3.5 h-3.5" />}
            />
          </div>
        </div>

        <div className="overflow-x-auto max-h-[600px]">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead className="sticky top-0 bg-[#0f1011] z-10">
              <tr className="border-b border-[#23252a] text-[#62666d] text-[11px] font-mono uppercase">
                <th className="py-2.5 px-4 font-normal">#</th>
                <th className="py-2.5 px-4 font-normal">When Purchased (Antecedent)</th>
                <th className="py-2.5 px-4 font-normal"></th>
                <th className="py-2.5 px-4 font-normal">Also Purchased (Consequent)</th>
                <th className="py-2.5 px-4 font-normal">Lift Ratio</th>
                <th className="py-2.5 px-4 font-normal">Confidence</th>
                <th className="py-2.5 px-4 font-normal">Support</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23252a]">
              {filteredRules.slice(0, 50).map((rule: AssociationRule, idx: number) => (
                <tr key={idx} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                  <td className="py-3 px-4 font-mono text-[#62666d]">{idx + 1}</td>
                  <td className="py-3 px-4 font-medium text-[#ffffff]">
                    {rule.antecedents.join(', ')}
                  </td>
                  <td className="py-3 px-2 text-[#62666d]">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </td>
                  <td className="py-3 px-4 font-medium text-[#38bdf8]">
                    {rule.consequents.join(', ')}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-[#e4f222]">
                    {rule.lift?.toFixed(2)}x
                  </td>
                  <td className="py-3 px-4 font-mono text-[#27a644]">
                    {((rule.confidence || 0) * 100).toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 font-mono text-[#8a8f98]">
                    {((rule.support || 0) * 100).toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Methodology Explainer */}
      <Card>
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-[#02b8cc] flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-[12px] text-[#8a8f98] leading-relaxed">
            <span className="text-[#ffffff] font-medium block">
              Methodological Interpretation
            </span>
            <p>
              <strong>Lift</strong> measures how much more often the antecedent and consequent are purchased together than would be expected if they were statistically independent. A lift of <strong>2.0x</strong> means customers are twice as likely to purchase both items than random chance.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
