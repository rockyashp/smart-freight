import React, { useState } from 'react';
import { PageHeader } from '../components/layout/PageHeader';
import { PredictionForm } from '../components/prediction/PredictionForm';
import { PredictionResultModal } from '../components/prediction/PredictionResultModal';
import { GeodesicRouteMap } from '../components/shipment/GeodesicRouteMap';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { PredictionResult, PredictionInput } from '../types';
import { ShieldCheck, Info, CheckCircle2, Globe2 } from 'lucide-react';

export const PredictPage: React.FC = () => {
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [lastInput, setLastInput] = useState<PredictionInput | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleSuccess = (res: PredictionResult, input: PredictionInput) => {
    setResult(res);
    setLastInput(input);
    setModalOpen(true);
  };

  const handleReset = () => {
    setResult(null);
    setLastInput(null);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Shipment Duration Predictor"
        subtitle="Accurate transit time forecasting and proactive delivery delay evaluation"
        badge={
          <Badge variant="lime" size="sm" dot>
            Live Estimator
          </Badge>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Prediction Form */}
        <div className="lg:col-span-2">
          <PredictionForm onSuccess={handleSuccess} />
        </div>

        {/* Informational & Audit Sidebar */}
        <div className="space-y-4">
          {/* Active Transit Corridor Preview */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono text-[#8a8f98] uppercase tracking-wider flex items-center gap-1.5">
                <Globe2 className="w-3.5 h-3.5 text-[#02b8cc]" />
                Transit Corridor Visualizer
              </span>
              <Badge variant="neutral" size="sm">Hub SJU-01</Badge>
            </div>
            <GeodesicRouteMap
              destination={{
                country: lastInput?.['Order Country'] || 'Alemania',
                state: lastInput?.['Order State'] || 'Bavaria',
                market: lastInput?.Market || 'Europe',
              }}
            />
          </div>

          <Card>
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#23252a]">
              <ShieldCheck className="w-4 h-4 text-[#27a644]" />
              <h4 className="text-[13px] font-[510] text-[#ffffff] tracking-tight">
                How Delivery Estimates Work
              </h4>
            </div>

            <p className="text-[12px] text-[#8a8f98] leading-relaxed mb-3">
              Calculations are generated prior to dispatch using order parameters, selected carrier speed tier, and destination regional routing history.
            </p>

            <div className="space-y-2 text-[12px]">
              <div className="p-2.5 rounded-[6px] bg-[#27a644]/5 border border-[#27a644]/20">
                <span className="font-medium text-[#27a644] flex items-center gap-1.5 mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Key Factors Evaluated:
                </span>
                <p className="text-[#8a8f98] text-[11px] leading-tight">
                  Carrier service level, promised transit schedule, destination market & state, merchandise category, and order volume.
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#23252a]">
              <Info className="w-4 h-4 text-[#38bdf8]" />
              <h4 className="text-[13px] font-[510] text-[#ffffff] tracking-tight">
                Delay Risk Thresholds
              </h4>
            </div>
            <p className="text-[12px] text-[#8a8f98] leading-relaxed">
              If forecasted transit duration exceeds the scheduled delivery date by more than <span className="font-mono text-[#ffffff]">0.3 days</span>, the shipment is flagged as a <span className="text-[#eb5757] font-medium">Potential Delay Risk</span> so logistics teams can expedite processing.
            </p>
          </Card>
        </div>
      </div>

      {/* Result Modal */}
      <PredictionResultModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        result={result}
        input={lastInput}
        onReset={handleReset}
      />
    </div>
  );
};

