import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { analyticsService } from '../services/analyticsService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Award } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [suite, setSuite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    analyticsService
      .getRegressionBenchmark()
      .then((res: any) => {
        setSuite(res);
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to fetch regression benchmark suite');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <LoadingState message="Loading transit accuracy benchmarks..." />;
  }

  if (error || !suite) {
    return (
      <div className="space-y-6">
        <PageHeader title="Regression Analytics" subtitle="Transit forecasting performance benchmarks" />
        <EmptyState
          title="Benchmark Suite Unavailable"
          description={error || 'Could not load benchmark cache.'}
          actionLabel="Retry"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  const benchmarkTable = suite.benchmark_table || [];
  const bestModel = suite.best_model || benchmarkTable[0] || {};
  const featureImportances = bestModel.feature_importances?.slice(0, 15) || [];

  // Data formatted for Recharts comparison
  const chartData = benchmarkTable.map((row: any) => ({
    name: row.display_name.replace(' Regressor', '').replace(' Regression', ''),
    RMSE: row.rmse,
    MAE: row.mae,
    R2: row.r2_score,
  }));

  const featureChartData = featureImportances.map((item: any) => ({
    name: item.feature,
    importance: Number((item.importance * 100).toFixed(1)),
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Predictive Analytics & Model Benchmarks"
        subtitle="Performance evaluation and accuracy benchmarks across shipping forecast models"
        badge={
          <Badge variant="lime" size="sm" dot>
            {benchmarkTable.length} Models Benchmarked
          </Badge>
        }
      />

      {/* ── Winning Production Architecture Banner ───────────────────────── */}
      <div className="p-5 rounded-[12px] bg-[#0f1011] border border-[#23252a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#e4f222]/10 border border-[#e4f222]/20 flex items-center justify-center text-[#e4f222]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#8a8f98] font-mono">Primary Forecasting Engine:</span>
              <Badge variant="lime" size="sm">Highest Accuracy</Badge>
            </div>
            <h2 className="text-[20px] font-[510] text-[#ffffff] tracking-tight mt-0.5">
              {bestModel.display_name || 'Random Forest Regressor'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#23252a] font-mono text-[13px]">
          <div>
            <span className="text-[11px] text-[#62666d] block">Test RMSE</span>
            <span className="text-[#38bdf8] font-bold text-[16px]">{bestModel.rmse}d</span>
          </div>
          <div>
            <span className="text-[11px] text-[#62666d] block">Test MAE</span>
            <span className="text-[#27a644] font-bold text-[16px]">{bestModel.mae}d</span>
          </div>
          <div>
            <span className="text-[11px] text-[#62666d] block">R² Score</span>
            <span className="text-[#a78bfa] font-bold text-[16px]">{bestModel.r2_score}</span>
          </div>
        </div>
      </div>

      {/* ── Charts Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Model Error Comparison Bar Chart */}
        <Card>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#23252a]">
            <div>
              <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                Model Error Comparison (RMSE vs MAE)
              </h3>
              <p className="text-[12px] text-[#8a8f98]">
                Lower values indicate superior predictive accuracy
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 40 }}>
                <XAxis
                  dataKey="name"
                  stroke="#62666d"
                  fontSize={10}
                  tickLine={false}
                  interval={0}
                  angle={-30}
                  textAnchor="end"
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
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Bar dataKey="RMSE" fill="#38bdf8" radius={[4, 4, 0, 0]} name="RMSE (Days)" />
                <Bar dataKey="MAE" fill="#27a644" radius={[4, 4, 0, 0]} name="MAE (Days)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Feature Importances */}
        <Card>
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#23252a]">
            <div>
              <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                Primary Predictive Drivers (Feature Importance)
              </h3>
              <p className="text-[12px] text-[#8a8f98]">
                Normalized weight of pre-shipment features in best model
              </p>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={featureChartData}
                layout="vertical"
                margin={{ top: 5, right: 15, left: 40, bottom: 5 }}
              >
                <XAxis
                  type="number"
                  stroke="#62666d"
                  fontSize={10}
                  tickLine={false}
                  unit="%"
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  stroke="#8a8f98"
                  fontSize={10}
                  tickLine={false}
                  width={110}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f1011',
                    borderColor: '#23252a',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#ffffff',
                  }}
                  formatter={(val: any) => [`${val}%`, 'Relative Importance']}
                />
                <Bar dataKey="importance" fill="#e4f222" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* ── 7-Model Benchmark Matrix Table ──────────────────────────────── */}
      <Card padding="none">
        <div className="p-4 sm:p-5 border-b border-[#23252a]">
          <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
            Comprehensive Regression Benchmark Matrix
          </h3>
          <p className="text-[12px] text-[#8a8f98]">
            Evaluated on identical fixed 80/20 train/test split (Random State 42)
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[12px]">
            <thead>
              <tr className="border-b border-[#23252a] text-[#62666d] text-[11px] font-mono uppercase bg-[rgba(255,255,255,0.01)]">
                <th className="py-2.5 px-4 font-normal">Rank</th>
                <th className="py-2.5 px-4 font-normal">Model Architecture</th>
                <th className="py-2.5 px-4 font-normal">Type</th>
                <th className="py-2.5 px-4 font-normal">RMSE (Days)</th>
                <th className="py-2.5 px-4 font-normal">MAE (Days)</th>
                <th className="py-2.5 px-4 font-normal">MSE</th>
                <th className="py-2.5 px-4 font-normal">R² Score</th>
                <th className="py-2.5 px-4 font-normal">Train Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#23252a]">
              {benchmarkTable.map((row: any, idx: number) => {
                const isWinner = idx === 0;
                return (
                  <tr
                    key={row.model_key || idx}
                    className={`hover:bg-[rgba(255,255,255,0.02)] transition-colors ${
                      isWinner ? 'bg-[#e4f222]/5 font-medium' : ''
                    }`}
                  >
                    <td className="py-2.5 px-4 font-mono">
                      {isWinner ? (
                        <Badge variant="lime" size="sm">#1 Top</Badge>
                      ) : (
                        <span className="text-[#62666d]">#{idx + 1}</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-[#ffffff] font-medium">
                      {row.display_name}
                      {isWinner && (
                        <span className="ml-2 text-[10px] text-[#e4f222] font-mono uppercase">
                          [Production]
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-[#8a8f98]">
                      {row.model_type || 'Linear'}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#38bdf8] font-bold">
                      {row.rmse}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#27a644]">
                      {row.mae}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#8a8f98]">
                      {row.mse}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#a78bfa]">
                      {row.r2_score}
                    </td>
                    <td className="py-2.5 px-4 font-mono text-[#62666d]">
                      {row.training_time}s
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
