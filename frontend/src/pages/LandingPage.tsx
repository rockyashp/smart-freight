import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { CountUp } from '../components/ui/CountUp';
import { GeodesicRouteMap } from '../components/shipment/GeodesicRouteMap';
import {
  Boxes,
  ArrowRight,
  BarChart3,
  Users,
  Sparkles,
  Check,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-24 py-8 sm:py-16">
      {/* ── 1. Hero Section ──────────────────────────────────────────────── */}
      <section className="relative text-center max-w-4xl mx-auto px-4 space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#161718] border border-[#23252a] text-[#8a8f98] text-[12px] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-[#e4f222] animate-pulse" />
          <span>Production Regression Model Online (RMSE 0.97 Days)</span>
        </div>

        <h1 className="text-[40px] sm:text-[60px] lg:text-[68px] font-[510] text-[#ffffff] tracking-[-0.025em] leading-[1.05]">
          Smarter shipping decisions <br className="hidden sm:inline" />
          <span className="text-[#8a8f98]">start here.</span>
        </h1>

        <p className="text-[16px] sm:text-[18px] text-[#8a8f98] max-w-2xl mx-auto leading-relaxed">
          Predict shipment duration, understand delivery risks, and uncover hidden patterns from your verified supply chain data.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate('/predict')}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Predict a Shipment
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => navigate('/analytics')}
            icon={<BarChart3 className="w-4 h-4" />}
          >
            Explore Analytics
          </Button>
        </div>

        {/* ── Precision Product Frame (Linear Style) ───────────────────────── */}
        <div className="pt-10">
          <div className="relative mx-auto rounded-[12px] bg-[#0f1011] border border-[#23252a] p-3 sm:p-5 shadow-[0_8px_40px_rgba(0,0,0,0.8)] text-left space-y-4">
            {/* Header chrome */}
            <div className="flex items-center justify-between pb-3 border-b border-[#23252a]">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#23252a]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#23252a]" />
                <span className="w-2.5 h-2.5 rounded-full bg-[#23252a]" />
                <span className="text-[12px] font-mono text-[#62666d] ml-2">
                  smart-freight // active-geodesic-corridor
                </span>
              </div>
              <Badge variant="green" size="sm" dot>
                Live Pre-Shipment Engine
              </Badge>
            </div>

            {/* Metrics preview row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="p-4 rounded-[8px] bg-[rgba(255,255,255,0.02)] border border-[#23252a]">
                <span className="text-[11px] font-mono text-[#8a8f98] block">Forecasted Transit</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-[26px] font-mono font-[510] text-[#ffffff]">
                    <CountUp value={2.4} decimals={1} duration={800} />
                  </span>
                  <span className="text-[13px] text-[#8a8f98]">days</span>
                  <Badge variant="green" size="sm">
                    -1.6d Early
                  </Badge>
                </div>
                <span className="text-[11px] text-[#62666d] mt-1 block font-mono">
                  Scheduled: 4.0 days • Standard Class
                </span>
              </div>

              <div className="p-4 rounded-[8px] bg-[rgba(255,255,255,0.02)] border border-[#23252a]">
                <span className="text-[11px] font-mono text-[#8a8f98] block">Integrity Guarantee</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-[26px] font-mono font-[510] text-[#38bdf8]">0.0%</span>
                  <span className="text-[13px] text-[#8a8f98]">leakage</span>
                </div>
                <span className="text-[11px] text-[#62666d] mt-1 block">
                  Post-fulfillment attributes strictly excluded
                </span>
              </div>

              <div className="p-4 rounded-[8px] bg-[rgba(255,255,255,0.02)] border border-[#23252a]">
                <span className="text-[11px] font-mono text-[#8a8f98] block">Benchmark Basis</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-[26px] font-mono font-[510] text-[#a78bfa]">
                    <CountUp value={59606} decimals={0} duration={1200} />
                  </span>
                  <span className="text-[13px] text-[#8a8f98]">records</span>
                </div>
                <span className="text-[11px] text-[#62666d] mt-1 block">
                  DataCo Supply Chain Cleaned Dataset
                </span>
              </div>
            </div>

            {/* Dark Vector Geodesic Route Visualizer */}
            <GeodesicRouteMap
              destination={{
                country: 'Alemania',
                state: 'Bavaria',
                market: 'Europe',
              }}
            />
          </div>
        </div>
      </section>

      {/* ── 2. How It Works ──────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4">
        <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
          <Badge variant="lime" size="sm">Methodology</Badge>
          <h2 className="text-[28px] sm:text-[32px] font-[510] text-[#ffffff] tracking-[-0.015em]">
            Transparent Machine Learning Architecture
          </h2>
          <p className="text-[14px] text-[#8a8f98]">
            Built with strict feature boundaries to guarantee valid, real-world inference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="space-y-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#e4f222] font-mono text-[12px] font-bold">
              01
            </div>
            <h3 className="text-[15px] font-[510] text-[#ffffff] tracking-tight">Data Ingestion</h3>
            <p className="text-[12px] text-[#8a8f98] leading-relaxed">
              Ingests 59,606 transactions from the DataCo supply chain dataset, parsing dates and geographic hierarchies.
            </p>
          </Card>

          <Card className="space-y-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#02b8cc] font-mono text-[12px] font-bold">
              02
            </div>
            <h3 className="text-[15px] font-[510] text-[#ffffff] tracking-tight">Leakage Elimination</h3>
            <p className="text-[12px] text-[#8a8f98] leading-relaxed">
              Strictly drops post-delivery fields (delivery status, delivery delay risk, shipping date) to prevent false accuracy.
            </p>
          </Card>

          <Card className="space-y-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#a78bfa] font-mono text-[12px] font-bold">
              03
            </div>
            <h3 className="text-[15px] font-[510] text-[#ffffff] tracking-tight">Multi-Model Benchmark</h3>
            <p className="text-[12px] text-[#8a8f98] leading-relaxed">
              Trains 8 regression architectures on an 80/20 held-out split, selecting the model with the lowest test RMSE.
            </p>
          </Card>

          <Card className="space-y-3">
            <div className="w-8 h-8 rounded-[6px] bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#27a644] font-mono text-[12px] font-bold">
              04
            </div>
            <h3 className="text-[15px] font-[510] text-[#ffffff] tracking-tight">Instant Inference</h3>
            <p className="text-[12px] text-[#8a8f98] leading-relaxed">
              Serialized joblib pipelines deliver sub-second shipping forecasts, logging every decision to SQLite history.
            </p>
          </Card>
        </div>
      </section>

      {/* ── 3. Core Capabilities ─────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6 sm:p-8 flex flex-col justify-between hover:border-[#383b3f] transition-colors">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-[8px] bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#e4f222]">
                <Boxes className="w-5 h-5" />
              </div>
              <h3 className="text-[18px] font-[510] text-[#ffffff] tracking-tight">
                Single & Batch Duration Forecasting
              </h3>
              <p className="text-[13px] text-[#8a8f98] leading-relaxed">
                Estimate expected shipping days before an order is fulfilled. Upload bulk CSV manifests to batch-score thousands of pending shipments in seconds.
              </p>
              <ul className="space-y-1.5 pt-2 text-[12px] text-[#8a8f98]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#27a644]" />
                  <span>Cascading market, region, country, and state validation</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#27a644]" />
                  <span>Variance detection between scheduled and expected transit</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/predict')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                Run Prediction Form
              </Button>
            </div>
          </Card>

          <Card className="p-6 sm:p-8 flex flex-col justify-between hover:border-[#383b3f] transition-colors">
            <div className="space-y-3">
              <div className="w-9 h-9 rounded-[8px] bg-[#161718] border border-[#23252a] flex items-center justify-center text-[#02b8cc]">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-[18px] font-[510] text-[#ffffff] tracking-tight">
                Customer Clustering & Segment Profiles
              </h3>
              <p className="text-[13px] text-[#8a8f98] leading-relaxed">
                K-Means clustering automatically groups customer profiles based on RFM purchase behavior, average discount sensitivity, and shipping duration tolerance.
              </p>
              <ul className="space-y-1.5 pt-2 text-[12px] text-[#8a8f98]">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#27a644]" />
                  <span>Identified customer personas with actionable logistics strategies</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-[#27a644]" />
                  <span>2D PCA dimensionality reduction visualization</span>
                </li>
              </ul>
            </div>
            <div className="pt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/customers')}
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                View Customer Segments
              </Button>
            </div>
          </Card>
        </div>
      </section>

      {/* ── 4. Call to Action ────────────────────────────────────────────── */}
      <section className="max-w-[1200px] mx-auto px-4">
        <div className="p-8 sm:p-12 rounded-[12px] bg-[#0f1011] border border-[#23252a] text-center space-y-4">
          <h2 className="text-[26px] sm:text-[32px] font-[510] text-[#ffffff] tracking-tight">
            Ready to forecast your first shipment?
          </h2>
          <p className="text-[14px] text-[#8a8f98] max-w-lg mx-auto">
            Input pre-shipment order parameters to test empirical delivery duration forecasts.
          </p>
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/predict')}
              icon={<Sparkles className="w-4 h-4" />}
            >
              Start Predicting Now
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};
