import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { LoadingState } from '../components/ui/LoadingState';
import { EmptyState } from '../components/ui/EmptyState';
import { analyticsService } from '../services/analyticsService';
import type { AnalyticsSuiteData, AnalyticsModel } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import {
  Award,
  BarChart3,
  Grid3X3,
  GitCompare,
  TrendingUp,
  Layers,
  ShieldCheck,
} from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const [suite, setSuite] = useState<AnalyticsSuiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active sub-analysis tab
  const [activeTab, setActiveTab] = useState<'benchmarks' | 'heatmaps' | 'comparison' | 'distribution'>('benchmarks');

  // Head-to-head comparison model selections
  const [compareModelA, setCompareModelA] = useState<string>('Random Forest Regressor');
  const [compareModelB, setCompareModelB] = useState<string>('Decision Tree Regressor');

  useEffect(() => {
    analyticsService
      .getAnalyticsSuite()
      .then((res) => {
        setSuite(res);
        if (res.models && res.models.length >= 2) {
          setCompareModelA(res.models[0].name);
          setCompareModelB(res.models[2]?.name || res.models[1].name);
        }
        setLoading(false);
      })
      .catch((err: any) => {
        setError(err.message || 'Failed to fetch analytics suite');
        setLoading(false);
      });
  }, []);

  // Compute selected comparison models
  const modelA = useMemo<AnalyticsModel | undefined>(() => {
    return suite?.models?.find((m) => m.name === compareModelA);
  }, [suite, compareModelA]);

  const modelB = useMemo<AnalyticsModel | undefined>(() => {
    return suite?.models?.find((m) => m.name === compareModelB);
  }, [suite, compareModelB]);

  if (loading) {
    return <LoadingState message="Loading transit analytics, performance matrices, and model benchmarks..." />;
  }

  if (error || !suite) {
    return (
      <div className="space-y-6">
        <PageHeader title="Logistics & Model Analytics" subtitle="Performance benchmarks and route matrices" />
        <EmptyState
          title="Analytics Data Unavailable"
          description={error || 'Could not load analytics suite.'}
          actionLabel="Retry Connection"
          onAction={() => window.location.reload()}
        />
      </div>
    );
  }

  const {
    best_model,
    models = [],
    feature_importances = [],
    correlation_heatmap,
    market_mode_matrix = [],
    transit_distribution,
    category_distribution,
    mode_distribution,
  } = suite;

  // Chart data: Error comparison for all models
  const errorChartData = models.map((m) => ({
    name: m.name.replace(' Regressor', '').replace(' Regression', ''),
    fullName: m.name,
    RMSE: m.rmse,
    MAE: m.mae,
    R2: m.r2,
  }));

  // Top feature importances
  const featureChartData = feature_importances.slice(0, 10).map((f) => ({
    name: f.feature,
    importance: Number((f.importance * 100).toFixed(1)),
  }));

  // Transit days distribution histogram
  const transitHistData = (transit_distribution?.labels || []).map((label, idx) => ({
    days: label,
    orders: transit_distribution.values[idx] || 0,
  }));

  // Shipping mode volume data
  const modeChartData = (mode_distribution?.labels || []).map((label, idx) => ({
    mode: label,
    volume: mode_distribution.values[idx] || 0,
  }));

  // Product categories volume data
  const categoryChartData = (category_distribution?.labels || []).map((label, idx) => ({
    category: label,
    orders: category_distribution.values[idx] || 0,
  }));

  const CATEGORY_COLORS = ['#e4f222', '#02b8cc', '#38bdf8', '#a78bfa', '#ec4899', '#62666d'];

  // Helper for correlation heatmap cell color
  const getCorrelationColor = (val: number) => {
    if (val === 1.0) return 'bg-[#e4f222]/30 text-[#e4f222] font-bold border-[#e4f222]/40';
    if (val >= 0.5) return 'bg-[#02b8cc]/25 text-[#38bdf8] font-medium border-[#02b8cc]/30';
    if (val > 0.1) return 'bg-[#38bdf8]/15 text-[#ffffff] border-[#38bdf8]/20';
    if (val < -0.1) return 'bg-[#eb5757]/20 text-[#eb5757] font-medium border-[#eb5757]/30';
    return 'bg-[#161718] text-[#8a8f98] border-[#23252a]';
  };

  // Helper for delivery duration heatmap cell color
  const getDurationColor = (days: number) => {
    if (days <= 1.0) return 'bg-[#27a644]/20 text-[#27a644] font-medium border-[#27a644]/30';
    if (days <= 2.5) return 'bg-[#02b8cc]/20 text-[#02b8cc] font-medium border-[#02b8cc]/30';
    if (days <= 4.0) return 'bg-[#e4f222]/15 text-[#e4f222] font-medium border-[#e4f222]/30';
    return 'bg-[#eb5757]/20 text-[#eb5757] font-medium border-[#eb5757]/30';
  };

  return (
    <div className="space-y-6">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <PageHeader
        title="Predictive Analytics & Model Benchmarks"
        subtitle="Multi-dimensional performance matrices, transit heatmaps, and empirical architecture comparisons"
        badge={
          <Badge variant="lime" size="sm" dot>
            {models.length} Models Benchmarked
          </Badge>
        }
      />

      {/* ── Production Champion Model Banner ─────────────────────────────── */}
      <div className="p-5 rounded-[12px] bg-[#0f1011] border border-[#23252a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-full bg-[#e4f222]/10 border border-[#e4f222]/20 flex items-center justify-center text-[#e4f222]">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[12px] text-[#8a8f98] font-mono">Production Engine:</span>
              <Badge variant="lime" size="sm">Top Performance</Badge>
            </div>
            <h2 className="text-[20px] font-[510] text-[#ffffff] tracking-tight mt-0.5">
              {best_model?.name || 'Random Forest Regressor'}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-6 border-t sm:border-t-0 pt-3 sm:pt-0 border-[#23252a] font-mono text-[13px]">
          <div>
            <span className="text-[11px] text-[#62666d] block">Test RMSE</span>
            <span className="text-[#38bdf8] font-bold text-[16px]">{best_model?.metrics?.rmse || 0.9715}d</span>
          </div>
          <div>
            <span className="text-[11px] text-[#62666d] block">Test MAE</span>
            <span className="text-[#27a644] font-bold text-[16px]">{best_model?.metrics?.mae || 0.6938}d</span>
          </div>
          <div>
            <span className="text-[11px] text-[#62666d] block">R² Accuracy</span>
            <span className="text-[#a78bfa] font-bold text-[16px]">{best_model?.metrics?.r2 || 0.6408}</span>
          </div>
        </div>
      </div>

      {/* ── Sub-Analysis Navigation Tabs ─────────────────────────────────── */}
      <div className="flex items-center gap-2 p-1.5 rounded-[10px] bg-[#0f1011] border border-[#23252a] overflow-x-auto text-[13px]">
        <button
          type="button"
          onClick={() => setActiveTab('benchmarks')}
          className={`px-4 py-2 rounded-[6px] font-medium transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'benchmarks'
              ? 'bg-[#161718] text-[#ffffff] shadow-sm border border-[#383b3f]'
              : 'text-[#8a8f98] hover:text-[#ffffff]'
          }`}
        >
          <BarChart3 className="w-4 h-4 text-[#e4f222]" />
          <span>Model Benchmark Matrix</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('heatmaps')}
          className={`px-4 py-2 rounded-[6px] font-medium transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'heatmaps'
              ? 'bg-[#161718] text-[#ffffff] shadow-sm border border-[#383b3f]'
              : 'text-[#8a8f98] hover:text-[#ffffff]'
          }`}
        >
          <Grid3X3 className="w-4 h-4 text-[#02b8cc]" />
          <span>Correlation & Risk Heatmaps</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('comparison')}
          className={`px-4 py-2 rounded-[6px] font-medium transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'comparison'
              ? 'bg-[#161718] text-[#ffffff] shadow-sm border border-[#383b3f]'
              : 'text-[#8a8f98] hover:text-[#ffffff]'
          }`}
        >
          <GitCompare className="w-4 h-4 text-[#a78bfa]" />
          <span>Head-to-Head Comparison</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('distribution')}
          className={`px-4 py-2 rounded-[6px] font-medium transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
            activeTab === 'distribution'
              ? 'bg-[#161718] text-[#ffffff] shadow-sm border border-[#383b3f]'
              : 'text-[#8a8f98] hover:text-[#ffffff]'
          }`}
        >
          <Layers className="w-4 h-4 text-[#38bdf8]" />
          <span>Transit & Volume Distributions</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: MODEL BENCHMARK MATRIX ─────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'benchmarks' && (
        <div className="space-y-6">
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Model Error Comparison Bar Chart */}
            <Card>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#23252a]">
                <div>
                  <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                    Prediction Error Comparison (RMSE vs MAE)
                  </h3>
                  <p className="text-[12px] text-[#8a8f98]">
                    Lower values indicate superior predictive accuracy
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={errorChartData} margin={{ top: 10, right: 10, left: -15, bottom: 40 }}>
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
                    Relative weight of variables in Random Forest duration forecasting
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
                      width={120}
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

          {/* Full Model Comparison Table */}
          <Card padding="none">
            <div className="p-4 sm:p-5 border-b border-[#23252a] flex items-center justify-between">
              <div>
                <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                  Evaluated Architecture Matrix ({models.length} Models)
                </h3>
                <p className="text-[12px] text-[#8a8f98]">
                  Tested on identical held-out 80/20 validation set with 21 pre-shipment features
                </p>
              </div>
              <Badge variant="teal" size="sm">Holdout Evaluation</Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#23252a] text-[#62666d] text-[11px] font-mono uppercase bg-[rgba(255,255,255,0.01)]">
                    <th className="py-2.5 px-4 font-normal">Rank</th>
                    <th className="py-2.5 px-4 font-normal">Model Architecture</th>
                    <th className="py-2.5 px-4 font-normal">Test RMSE (Days)</th>
                    <th className="py-2.5 px-4 font-normal">Test MAE (Days)</th>
                    <th className="py-2.5 px-4 font-normal">R² Score</th>
                    <th className="py-2.5 px-4 font-normal">MSE</th>
                    <th className="py-2.5 px-4 font-normal">Training Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23252a]">
                  {models.map((row, idx) => {
                    const isWinner = idx === 0;
                    return (
                      <tr
                        key={row.name}
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
                          {row.name}
                          {isWinner && (
                            <span className="ml-2 text-[10px] text-[#e4f222] font-mono uppercase">
                              [Active]
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[#38bdf8] font-bold">
                          {row.rmse.toFixed(4)}d
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[#27a644]">
                          {row.mae.toFixed(4)}d
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[#a78bfa]">
                          {row.r2.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[#8a8f98]">
                          {row.mse.toFixed(4)}
                        </td>
                        <td className="py-2.5 px-4 font-mono text-[#62666d]">
                          {row.train_time_sec ? `${row.train_time_sec.toFixed(1)}s` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: CORRELATION & TRANSIT RISK HEATMAPS ────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'heatmaps' && (
        <div className="space-y-6">
          {/* Heatmap 1: Feature Correlation Matrix */}
          <Card>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#23252a]">
              <div>
                <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                  Feature Correlation Heatmap Matrix
                </h3>
                <p className="text-[12px] text-[#8a8f98]">
                  Pearson correlation coefficients (-1.0 to +1.0) across primary numerical features
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[#eb5757]/20 text-[#eb5757] border border-[#eb5757]/30">Negative</span>
                <span className="px-2 py-0.5 rounded bg-[#161718] text-[#8a8f98] border border-[#23252a]">Neutral</span>
                <span className="px-2 py-0.5 rounded bg-[#02b8cc]/20 text-[#02b8cc] border border-[#02b8cc]/30">Moderate</span>
                <span className="px-2 py-0.5 rounded bg-[#e4f222]/30 text-[#e4f222] border border-[#e4f222]/40 font-bold">Strong</span>
              </div>
            </div>

            {correlation_heatmap?.features && (
              <div className="overflow-x-auto">
                <div className="min-w-[600px]">
                  {/* Column Headers */}
                  <div className="grid grid-cols-7 gap-1 text-[11px] font-mono text-[#8a8f98] pb-1 border-b border-[#23252a] mb-1">
                    <div className="p-2 font-medium text-[#62666d]">VARIABLES</div>
                    {correlation_heatmap.features.map((feat) => (
                      <div key={feat} className="p-2 text-center font-medium truncate" title={feat}>
                        {feat}
                      </div>
                    ))}
                  </div>

                  {/* Heatmap Rows */}
                  {correlation_heatmap.features.map((rowFeat, rowIdx) => (
                    <div key={rowFeat} className="grid grid-cols-7 gap-1 my-1">
                      <div className="p-2 text-[11px] font-mono text-[#ffffff] font-medium truncate flex items-center bg-[rgba(255,255,255,0.01)] rounded-[4px]">
                        {rowFeat}
                      </div>
                      {correlation_heatmap.matrix[rowIdx]?.map((val, colIdx) => (
                        <div
                          key={colIdx}
                          className={`p-2.5 rounded-[6px] border text-center font-mono text-[12px] transition-all flex flex-col items-center justify-center ${getCorrelationColor(
                            val
                          )}`}
                          title={`${rowFeat} vs ${correlation_heatmap.features[colIdx]}: ${val}`}
                        >
                          <span>{val.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-4 p-3 rounded-[6px] bg-[#161718] border border-[#23252a] text-[12px] text-[#8a8f98] flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#27a644] flex-shrink-0 mt-0.5" />
              <span>
                <strong>Key Insight:</strong> Scheduled shipping days shows a strong <strong>+0.54</strong> positive correlation with actual delivery duration, confirming promised service level as the single most influential predictive signal in the supply chain.
              </span>
            </div>
          </Card>

          {/* Heatmap 2: Market vs Shipping Mode Transit Matrix */}
          <Card>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#23252a]">
              <div>
                <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                  Regional Delivery Duration Heatmap (Market vs Shipping Mode)
                </h3>
                <p className="text-[12px] text-[#8a8f98]">
                  Average transit duration (days) across international trade corridors
                </p>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono">
                <span className="px-2 py-0.5 rounded bg-[#27a644]/20 text-[#27a644] border border-[#27a644]/30">≤ 1d Fast</span>
                <span className="px-2 py-0.5 rounded bg-[#02b8cc]/20 text-[#02b8cc] border border-[#02b8cc]/30">≤ 2.5d Rapid</span>
                <span className="px-2 py-0.5 rounded bg-[#e4f222]/15 text-[#e4f222] border border-[#e4f222]/30">~ 4d Standard</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12px]">
                <thead>
                  <tr className="border-b border-[#23252a] text-[#62666d] text-[11px] font-mono uppercase bg-[rgba(255,255,255,0.01)]">
                    <th className="py-2.5 px-4 font-normal">Market Corridor</th>
                    <th className="py-2.5 px-4 font-normal text-center">Same Day</th>
                    <th className="py-2.5 px-4 font-normal text-center">First Class</th>
                    <th className="py-2.5 px-4 font-normal text-center">Second Class</th>
                    <th className="py-2.5 px-4 font-normal text-center">Standard Class</th>
                    <th className="py-2.5 px-4 font-normal text-center">Market Average</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#23252a]">
                  {market_mode_matrix.map((row) => (
                    <tr key={row.market} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors">
                      <td className="py-3 px-4 font-medium text-[#ffffff] font-mono">
                        {row.market}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className={`py-1.5 px-2 rounded-[6px] border font-mono ${getDurationColor(row.same_day)}`}>
                          {row.same_day.toFixed(2)}d
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className={`py-1.5 px-2 rounded-[6px] border font-mono ${getDurationColor(row.first_class)}`}>
                          {row.first_class.toFixed(2)}d
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className={`py-1.5 px-2 rounded-[6px] border font-mono ${getDurationColor(row.second_class)}`}>
                          {row.second_class.toFixed(2)}d
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <div className={`py-1.5 px-2 rounded-[6px] border font-mono ${getDurationColor(row.standard_class)}`}>
                          {row.standard_class.toFixed(2)}d
                        </div>
                      </td>
                      <td className="py-2 px-3 text-center font-mono font-bold text-[#ffffff]">
                        {row.average_days.toFixed(2)}d
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: HEAD-TO-HEAD MODEL COMPARISON TOOL ─────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'comparison' && (
        <div className="space-y-6">
          <Card>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-[#23252a]">
              <div>
                <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                  Direct Head-to-Head Architecture Comparison
                </h3>
                <p className="text-[12px] text-[#8a8f98]">
                  Select two regression models to benchmark performance metrics, error trade-offs, and inference trade-offs
                </p>
              </div>

              {/* Model Selectors */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <select
                  value={compareModelA}
                  onChange={(e) => setCompareModelA(e.target.value)}
                  className="px-3 py-1.5 rounded-[6px] bg-[#161718] border border-[#23252a] text-[#ffffff] text-[12px] font-mono focus:border-[#e4f222] outline-none cursor-pointer"
                >
                  {models.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>

                <span className="text-[#8a8f98] font-mono text-[12px]">vs</span>

                <select
                  value={compareModelB}
                  onChange={(e) => setCompareModelB(e.target.value)}
                  className="px-3 py-1.5 rounded-[6px] bg-[#161718] border border-[#23252a] text-[#ffffff] text-[12px] font-mono focus:border-[#38bdf8] outline-none cursor-pointer"
                >
                  {models.map((m) => (
                    <option key={m.name} value={m.name}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Cards Grid */}
            {modelA && modelB && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Model A Card */}
                <div className="p-4 rounded-[10px] bg-[rgba(255,255,255,0.02)] border border-[#e4f222]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#e4f222]">
                        CANDIDATE ARCHITECTURE A
                      </span>
                      <h4 className="text-[16px] font-[510] text-[#ffffff] mt-0.5">{modelA.name}</h4>
                    </div>
                    <Badge variant={modelA.rank === 1 ? 'lime' : 'neutral'} size="sm">
                      Rank #{modelA.rank}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono">
                    <div className="p-2.5 rounded-[6px] bg-[#0f1011] border border-[#23252a]">
                      <span className="text-[10px] text-[#62666d] block">TEST RMSE</span>
                      <span className="text-[16px] font-bold text-[#38bdf8]">{modelA.rmse.toFixed(4)}d</span>
                    </div>
                    <div className="p-2.5 rounded-[6px] bg-[#0f1011] border border-[#23252a]">
                      <span className="text-[10px] text-[#62666d] block">TEST MAE</span>
                      <span className="text-[16px] font-bold text-[#27a644]">{modelA.mae.toFixed(4)}d</span>
                    </div>
                    <div className="p-2.5 rounded-[6px] bg-[#0f1011] border border-[#23252a]">
                      <span className="text-[10px] text-[#62666d] block">R² SCORE</span>
                      <span className="text-[16px] font-bold text-[#a78bfa]">{modelA.r2.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[12px] text-[#8a8f98]">
                    <div className="flex justify-between py-1 border-b border-[#23252a]">
                      <span>Mean Squared Error (MSE):</span>
                      <span className="font-mono text-[#ffffff]">{modelA.mse.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#23252a]">
                      <span>Training Execution:</span>
                      <span className="font-mono text-[#ffffff]">{modelA.train_time_sec ? `${modelA.train_time_sec.toFixed(1)}s` : 'Fast'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Model Family:</span>
                      <span className="font-mono text-[#e4f222]">
                        {modelA.name.includes('Forest') ? 'Bagging Ensemble' : modelA.name.includes('Tree') ? 'Non-linear Tree' : 'Linear / Regularized'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Model B Card */}
                <div className="p-4 rounded-[10px] bg-[rgba(255,255,255,0.02)] border border-[#38bdf8]/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#38bdf8]">
                        CANDIDATE ARCHITECTURE B
                      </span>
                      <h4 className="text-[16px] font-[510] text-[#ffffff] mt-0.5">{modelB.name}</h4>
                    </div>
                    <Badge variant={modelB.rank === 1 ? 'lime' : 'neutral'} size="sm">
                      Rank #{modelB.rank}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-2 font-mono">
                    <div className="p-2.5 rounded-[6px] bg-[#0f1011] border border-[#23252a]">
                      <span className="text-[10px] text-[#62666d] block">TEST RMSE</span>
                      <span className="text-[16px] font-bold text-[#38bdf8]">{modelB.rmse.toFixed(4)}d</span>
                    </div>
                    <div className="p-2.5 rounded-[6px] bg-[#0f1011] border border-[#23252a]">
                      <span className="text-[10px] text-[#62666d] block">TEST MAE</span>
                      <span className="text-[16px] font-bold text-[#27a644]">{modelB.mae.toFixed(4)}d</span>
                    </div>
                    <div className="p-2.5 rounded-[6px] bg-[#0f1011] border border-[#23252a]">
                      <span className="text-[10px] text-[#62666d] block">R² SCORE</span>
                      <span className="text-[16px] font-bold text-[#a78bfa]">{modelB.r2.toFixed(4)}</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[12px] text-[#8a8f98]">
                    <div className="flex justify-between py-1 border-b border-[#23252a]">
                      <span>Mean Squared Error (MSE):</span>
                      <span className="font-mono text-[#ffffff]">{modelB.mse.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-[#23252a]">
                      <span>Training Execution:</span>
                      <span className="font-mono text-[#ffffff]">{modelB.train_time_sec ? `${modelB.train_time_sec.toFixed(1)}s` : 'Fast'}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Model Family:</span>
                      <span className="font-mono text-[#38bdf8]">
                        {modelB.name.includes('Forest') ? 'Bagging Ensemble' : modelB.name.includes('Tree') ? 'Non-linear Tree' : 'Linear / Regularized'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Differential Delta Summary */}
            {modelA && modelB && (
              <div className="mt-4 p-4 rounded-[8px] bg-[#161718] border border-[#23252a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[12px]">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#e4f222]" />
                  <span className="text-[#ffffff] font-medium">Head-to-Head Error Delta:</span>
                  <span className="text-[#8a8f98]">
                    {modelA.rmse < modelB.rmse
                      ? `${modelA.name} achieves ${(modelB.rmse - modelA.rmse).toFixed(4)} days lower test RMSE than ${modelB.name}.`
                      : `${modelB.name} achieves ${(modelA.rmse - modelB.rmse).toFixed(4)} days lower test RMSE than ${modelA.name}.`}
                  </span>
                </div>
                <Badge variant={modelA.rmse <= modelB.rmse ? 'lime' : 'teal'} size="sm">
                  {modelA.rmse <= modelB.rmse ? `${modelA.name} Leads` : `${modelB.name} Leads`}
                </Badge>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 4: TRANSIT & VOLUME DISTRIBUTIONS ─────────────────────────── */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {activeTab === 'distribution' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Histogram: Actual Shipping Days Distribution */}
            <Card>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#23252a]">
                <div>
                  <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                    Transit Duration Frequency (0 to 6 Days)
                  </h3>
                  <p className="text-[12px] text-[#8a8f98]">
                    Actual delivery duration frequency across 59,606 verified shipments
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={transitHistData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <XAxis dataKey="days" stroke="#62666d" fontSize={11} tickLine={false} />
                    <YAxis stroke="#62666d" fontSize={11} tickLine={false} axisLine={{ stroke: '#23252a' }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f1011',
                        borderColor: '#23252a',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#ffffff',
                      }}
                      formatter={(val: any) => [val.toLocaleString(), 'Verified Shipments']}
                    />
                    <Bar dataKey="orders" fill="#02b8cc" radius={[4, 4, 0, 0]}>
                      {transitHistData.map((_, index) => (
                        <Cell
                          key={`hist-${index}`}
                          fill={index === 2 ? '#e4f222' : '#02b8cc'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 text-[11px] text-[#62666d] flex items-center justify-between font-mono">
                <span>Peak Frequency: 2 Days (20,279 shipments)</span>
                <span className="text-[#e4f222]">• Mode Center</span>
              </div>
            </Card>

            {/* Shipping Mode Volume Share */}
            <Card>
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#23252a]">
                <div>
                  <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                    Fulfillment Speed Tier Distribution
                  </h3>
                  <p className="text-[12px] text-[#8a8f98]">
                    Total shipments handled by carrier fulfillment speed tier
                  </p>
                </div>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={modeChartData}
                    layout="vertical"
                    margin={{ top: 10, right: 20, left: 25, bottom: 0 }}
                  >
                    <XAxis type="number" stroke="#62666d" fontSize={10} tickLine={false} />
                    <YAxis
                      type="category"
                      dataKey="mode"
                      stroke="#8a8f98"
                      fontSize={11}
                      tickLine={false}
                      width={100}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f1011',
                        borderColor: '#23252a',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#ffffff',
                      }}
                      formatter={(val: any) => [val.toLocaleString(), 'Shipments']}
                    />
                    <Bar dataKey="volume" fill="#38bdf8" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 text-[11px] text-[#62666d] flex items-center justify-between font-mono">
                <span>Standard Class accounts for 55.4% of volume</span>
                <span className="text-[#38bdf8]">• 33,039 orders</span>
              </div>
            </Card>
          </div>

          {/* Product Category Volume Card */}
          <Card>
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#23252a]">
              <div>
                <h3 className="text-[14px] font-[510] text-[#ffffff] tracking-tight">
                  Merchandise Category Volume Distribution
                </h3>
                <p className="text-[12px] text-[#8a8f98]">
                  Order volume across highest-velocity merchandise departments
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="h-56 w-full md:col-span-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryChartData}
                      dataKey="orders"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={75}
                      paddingAngle={3}
                    >
                      {categoryChartData.map((_, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f1011',
                        borderColor: '#23252a',
                        borderRadius: '6px',
                        fontSize: '12px',
                        color: '#ffffff',
                      }}
                      formatter={(val: any) => [val.toLocaleString(), 'Orders']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-3 text-[12px]">
                {categoryChartData.map((item, idx) => (
                  <div
                    key={item.category}
                    className="p-2.5 rounded-[6px] bg-[rgba(255,255,255,0.02)] border border-[#23252a] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] }}
                      />
                      <span className="text-[#ffffff] font-medium truncate">{item.category}</span>
                    </div>
                    <span className="font-mono text-[#8a8f98]">{item.orders.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
