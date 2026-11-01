import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { analyticsService } from '../services/analyticsService';
import type { PredictionHistoryItem } from '../types';
import { Download, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const HistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterDelay, setFilterDelay] = useState<'all' | 'delayed' | 'ontime'>('all');

  useEffect(() => {
    analyticsService
      .getHistory(150)
      .then((res: { history: PredictionHistoryItem[]; total: number }) => {
        setHistory(res.history || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingState message="Loading shipment history records..." />;
  }

  const filteredHistory = history.filter((item) => {
    const matchesSearch =
      (item.order_country || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.category_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.shipping_mode || '').toLowerCase().includes(search.toLowerCase());

    const matchesDelay =
      filterDelay === 'all'
        ? true
        : filterDelay === 'delayed'
        ? Boolean(item.is_delayed_risk)
        : !item.is_delayed_risk;

    return matchesSearch && matchesDelay;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prediction History & Audit Log"
        subtitle="Complete log of forecasted shipments and delivery risk assessments"
        badge={
          <Badge variant="neutral" size="sm">
            {history.length} Logged Records
          </Badge>
        }
        actions={
          history.length > 0 ? (
            <a
              href={analyticsService.getHistoryExportCsvUrl()}
              className="inline-flex items-center gap-1.5 text-[12px] px-3 py-1.5 rounded-[6px] bg-[#161718] border border-[#23252a] text-[#d0d6e0] hover:text-[#ffffff] hover:border-[#383b3f] transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-[#e4f222]" />
              <span>Export All to CSV</span>
            </a>
          ) : undefined
        }
      />

      {history.length > 0 ? (
        <Card padding="none">
          {/* Filter Bar */}
          <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#23252a]">
            <div className="w-full sm:w-72">
              <Input
                placeholder="Search country, category, mode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                icon={<Search className="w-3.5 h-3.5" />}
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-[12px] text-[#8a8f98] font-mono">Filter Risk:</span>
              <div className="flex items-center gap-1 bg-[#161718] p-1 rounded-[6px] border border-[#23252a]">
                <button
                  onClick={() => setFilterDelay('all')}
                  className={`text-[11px] px-2.5 py-0.5 rounded-[4px] font-mono cursor-pointer transition-colors ${
                    filterDelay === 'all'
                      ? 'bg-[#e4f222] text-[#08090a] font-bold'
                      : 'text-[#8a8f98] hover:text-[#ffffff]'
                  }`}
                >
                  All ({history.length})
                </button>
                <button
                  onClick={() => setFilterDelay('delayed')}
                  className={`text-[11px] px-2.5 py-0.5 rounded-[4px] font-mono cursor-pointer transition-colors ${
                    filterDelay === 'delayed'
                      ? 'bg-[#eb5757] text-[#ffffff] font-bold'
                      : 'text-[#8a8f98] hover:text-[#ffffff]'
                  }`}
                >
                  Delayed Risk
                </button>
                <button
                  onClick={() => setFilterDelay('ontime')}
                  className={`text-[11px] px-2.5 py-0.5 rounded-[4px] font-mono cursor-pointer transition-colors ${
                    filterDelay === 'ontime'
                      ? 'bg-[#27a644] text-[#ffffff] font-bold'
                      : 'text-[#8a8f98] hover:text-[#ffffff]'
                  }`}
                >
                  On-Time
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto max-h-[600px]">
            <table className="w-full text-left border-collapse text-[12px]">
              <thead className="sticky top-0 bg-[#0f1011] z-10">
                <tr className="border-b border-[#23252a] text-[#62666d] text-[11px] font-mono uppercase">
                  <th className="py-2.5 px-4 font-normal">ID</th>
                  <th className="py-2.5 px-4 font-normal">Timestamp</th>
                  <th className="py-2.5 px-4 font-normal">Destination</th>
                  <th className="py-2.5 px-4 font-normal">Shipping Mode</th>
                  <th className="py-2.5 px-4 font-normal">Category</th>
                  <th className="py-2.5 px-4 font-normal">Sales</th>
                  <th className="py-2.5 px-4 font-normal">Scheduled</th>
                  <th className="py-2.5 px-4 font-normal text-[#e4f222]">Predicted</th>
                  <th className="py-2.5 px-4 font-normal">Assessment</th>
                  <th className="py-2.5 px-4 font-normal">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23252a]">
                {filteredHistory.map((row) => (
                  <tr key={row.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[#8a8f98]">#{row.id}</td>
                    <td className="py-2.5 px-4 font-mono text-[#62666d] text-[11px]">
                      {row.created_at ? row.created_at.replace('T', ' ').slice(0, 16) : '—'}
                    </td>
                    <td className="py-2.5 px-4 text-[#ffffff] font-medium">
                      {row.order_country}
                      <span className="text-[#62666d] font-normal block text-[10px]">
                        {row.order_state ? `${row.order_state}, ` : ''}{row.order_region}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[#8a8f98]">{row.shipping_mode}</td>
                    <td className="py-2.5 px-4 text-[#8a8f98]">{row.category_name}</td>
                    <td className="py-2.5 px-4 font-mono text-[#8a8f98]">
                      ${Number(row.sales || 0).toFixed(2)}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#8a8f98]">{row.scheduled_days}d</td>
                    <td className="py-2.5 px-4 font-mono text-[#ffffff] font-bold text-[13px]">
                      {Math.ceil(Number(row.predicted_days || 0))}d
                      <span className="text-[10px] text-[#62666d] block font-normal">
                        (~{Number(row.predicted_days || 0).toFixed(1)}d)
                      </span>
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge variant={row.is_delayed_risk ? 'red' : 'green'} size="sm">
                        {row.is_delayed_risk ? 'Potential Delay' : 'On-Time'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[10px] text-[#62666d] uppercase">
                      {row.source || 'manual'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <EmptyState
          title="No prediction history yet"
          description="Every shipment prediction you execute in the prediction form or via batch CSV will be permanently logged here."
          actionLabel="Run First Prediction"
          onAction={() => navigate('/predict')}
        />
      )}
    </div>
  );
};
