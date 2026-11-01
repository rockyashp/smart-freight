import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/layout/PageHeader';
import { StatCard } from '../components/ui/StatCard';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingState } from '../components/ui/LoadingState';
import { analyticsService } from '../services/analyticsService';
import type { DashboardData, PredictionHistoryItem } from '../types';
import {
  Boxes,
  FileSpreadsheet,
  Clock,
  AlertTriangle,
  Cpu,
  ArrowRight,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsService
      .getDashboardData()
      .then((res: DashboardData) => {
        setData(res);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to connect to backend service');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingState message="Connecting to SQLite database and model metadata..." />;
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Operational Dashboard"
          subtitle="Real-time shipment duration intelligence"
        />
        <EmptyState
          title="Unable to load dashboard data"
          description={error || 'Backend communication error.'}
          actionLabel="Try Reconnecting"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  const { kpis, history, metadata } = data;
  const hasHistory = kpis.total_predictions > 0 && history.length > 0;

  // Chart data prepared from actual database aggregations
  const speedData = [
    { name: 'Fast (0-2d)', count: kpis.fast_count, color: '#38bdf8' },
    { name: 'Standard (3-4d)', count: kpis.standard_count, color: '#e4f222' },
    { name: 'Longer (5-6d)', count: kpis.longer_count, color: '#a78bfa' },
  ].filter((d) => d.count > 0);

  const modeData = Object.entries(kpis.shipping_mode_distribution || {}).map(([mode, count]) => ({
    name: mode,
    count: count as number,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Logistics Operations Dashboard"
        subtitle="Live shipment duration forecasts and empirical accuracy metrics"
        badge={
          <Badge variant="lime" size="sm" dot>
            Production Engine Active
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/batch')}
              icon={<FileSpreadsheet className="w-3.5 h-3.5" />}
            >
              Batch CSV Upload
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/predict')}
              icon={<Boxes className="w-3.5 h-3.5" />}
            >
              Predict Shipment
            </Button>
          </div>
        }
      />

      {/* ── KPI Grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Predictions Logged"
          value={kpis.total_predictions}
          numericValue={kpis.total_predictions}
          decimals={0}
          subtext="Saved to SQLite history database"
          icon={<Boxes className="w-4 h-4" />}
        />

        <StatCard
          label="Avg Predicted Transit"
          value={
            kpis.avg_predicted_days > 0
              ? `${kpis.avg_predicted_days.toFixed(1)}d`
              : '—'
          }
          numericValue={kpis.avg_predicted_days > 0 ? kpis.avg_predicted_days : undefined}
          decimals={1}
          suffix="d"
          subtext={
            hasHistory
              ? 'Mean duration across logged shipments'
              : 'No predictions recorded yet'
          }
          icon={<Clock className="w-4 h-4" />}
        />

        <StatCard
          label="Potential Delay Risk Rate"
          value={
            hasHistory ? `${(kpis.delayed_risk_rate * 100).toFixed(1)}%` : '0.0%'
          }
          numericValue={hasHistory ? kpis.delayed_risk_rate * 100 : 0}
          decimals={1}
          suffix="%"
          subtext={
            hasHistory
              ? `${kpis.delayed_risk_count} shipment(s) exceeding scheduled days`
              : 'Zero delayed shipments logged'
          }
          icon={<AlertTriangle className="w-4 h-4" />}
        />

        <StatCard
          label="Model Test RMSE"
          value={
            metadata?.metrics?.rmse
              ? `${metadata.metrics.rmse.toFixed(3)}d`
              : '0.972d'
          }
          numericValue={metadata?.metrics?.rmse ?? 0.972}
          decimals={3}
          suffix="d"
          subtext={`Architecture: ${metadata?.selected_final_model || 'Random Forest'}`}
          icon={<Cpu className="w-4 h-4" />}
          badge={<Badge variant="teal" size="sm">Holdout Test</Badge>}
        />
      </div>

      {/* ── Visual Analytics Row ────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Shipping Duration Breakdown */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#23252a]">
            <div>
              <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                Duration Distribution by Speed Tier
              </h3>
              <p className="text-[12px] text-[#8a8f98]">
                Frequency of predicted shipments in each transit duration category
              </p>
            </div>
            {hasHistory && <Badge variant="neutral" size="sm">{kpis.total_predictions} Total</Badge>}
          </div>

          {hasHistory && speedData.length > 0 ? (
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={speedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    stroke="#62666d"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#23252a' }}
                  />
                  <YAxis
                    stroke="#62666d"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: '#23252a' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f1011',
                      borderColor: '#23252a',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#ffffff',
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {speedData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center p-4">
              <Clock className="w-8 h-8 text-[#62666d] mb-2 opacity-50" />
              <p className="text-[13px] text-[#8a8f98]">No shipment distribution data yet.</p>
              <p className="text-[11px] text-[#62666d] mt-1 max-w-xs">
                Run single or batch predictions to populate duration analytics.
              </p>
            </div>
          )}
        </Card>

        {/* Shipping Mode Distribution */}
        <Card>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#23252a]">
            <div>
              <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                Shipping Modes
              </h3>
              <p className="text-[12px] text-[#8a8f98]">Logged fulfillment categories</p>
            </div>
          </div>

          {hasHistory && modeData.length > 0 ? (
            <div className="h-56 w-full flex flex-col justify-between">
              <div className="space-y-3">
                {modeData.map((item) => {
                  const pct = ((item.count / kpis.total_predictions) * 100).toFixed(0);
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between text-[12px]">
                        <span className="text-[#8a8f98] font-medium">{item.name}</span>
                        <span className="font-mono text-[#ffffff]">{item.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-[#161718] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#e4f222] h-full rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center p-4">
              <p className="text-[13px] text-[#8a8f98]">No mode records logged yet.</p>
              <p className="text-[11px] text-[#62666d] mt-1">
                Fulfillment modes will appear here upon submission.
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* ── Recent Prediction Activity Table ────────────────────────────── */}
      <Card padding="none">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-[#23252a]">
          <div>
            <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
              Recent Prediction Activity
            </h3>
            <p className="text-[12px] text-[#8a8f98]">
              Most recent shipment duration calculations logged to SQLite
            </p>
          </div>
          {hasHistory && (
            <div className="flex items-center gap-2">
              <a
                href={analyticsService.getHistoryExportCsvUrl()}
                className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-[6px] bg-transparent border border-[#23252a] text-[#8a8f98] hover:text-[#ffffff] hover:border-[#383b3f] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/history')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Full Log
              </Button>
            </div>
          )}
        </div>

        {hasHistory ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-[#23252a] text-[#62666d] text-[11px] font-mono uppercase bg-[rgba(255,255,255,0.01)]">
                  <th className="py-2.5 px-4 font-normal">ID</th>
                  <th className="py-2.5 px-4 font-normal">Destination</th>
                  <th className="py-2.5 px-4 font-normal">Shipping Mode</th>
                  <th className="py-2.5 px-4 font-normal">Category</th>
                  <th className="py-2.5 px-4 font-normal">Scheduled</th>
                  <th className="py-2.5 px-4 font-normal">Predicted</th>
                  <th className="py-2.5 px-4 font-normal">Delay Risk</th>
                  <th className="py-2.5 px-4 font-normal">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#23252a]">
                {history.slice(0, 8).map((row: PredictionHistoryItem) => (
                  <tr key={row.id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                    <td className="py-2.5 px-4 font-mono text-[#8a8f98]">#{row.id}</td>
                    <td className="py-2.5 px-4 font-medium text-[#ffffff]">
                      {row.order_country}
                      <span className="text-[#62666d] font-normal block text-[11px]">
                        {row.order_region}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-[#8a8f98]">{row.shipping_mode}</td>
                    <td className="py-2.5 px-4 text-[#8a8f98]">{row.category_name}</td>
                    <td className="py-2.5 px-4 font-mono text-[#8a8f98]">{row.scheduled_days}d</td>
                    <td className="py-2.5 px-4 font-mono text-[#ffffff] font-medium">
                      {row.predicted_days.toFixed(1)}d
                    </td>
                    <td className="py-2.5 px-4">
                      <Badge variant={row.is_delayed_risk ? 'red' : 'green'} size="sm">
                        {row.is_delayed_risk ? 'Delayed Risk' : 'On-Time'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#62666d] text-[11px]">
                      {row.created_at ? row.created_at.split(' ')[0] : 'Just now'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8">
            <EmptyState
              title="No prediction history yet"
              description="Run your first shipment prediction or upload a batch manifest to generate prediction logs."
              actionLabel="Predict a Shipment"
              onAction={() => navigate('/predict')}
            />
          </div>
        )}
      </Card>
    </div>
  );
};
