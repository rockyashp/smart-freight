import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { CountUp } from '../ui/CountUp';
import { GeodesicRouteMap } from '../shipment/GeodesicRouteMap';
import type { PredictionResult, PredictionInput } from '../../types';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface PredictionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  result: PredictionResult | null;
  input: PredictionInput | null;
  onReset: () => void;
}

export const PredictionResultModal: React.FC<PredictionResultModalProps> = ({
  isOpen,
  onClose,
  result,
  input,
  onReset,
}) => {
  const navigate = useNavigate();

  if (!result) return null;

  const isDelayed = result.is_delayed_risk;
  const roundedDays = result.predicted_shipping_days_rounded || Math.ceil(result.predicted_shipping_days);
  const roundedScheduled = Math.round(result.scheduled_shipping_days);
  const diffRounded = roundedDays - roundedScheduled;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Shipment Duration Forecast"
      subtitle="Calculated transit duration & route overview"
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Hero Result Banner */}
        <div
          className={`p-5 rounded-[10px] border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
            isDelayed
              ? 'bg-[#eb5757]/10 border-[#eb5757]/30 text-[#ffffff]'
              : 'bg-[#27a644]/10 border-[#27a644]/30 text-[#ffffff]'
          }`}
        >
          <div className="flex items-center gap-3.5">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                isDelayed ? 'bg-[#eb5757]/20 text-[#eb5757]' : 'bg-[#27a644]/20 text-[#27a644]'
              }`}
            >
              {isDelayed ? (
                <AlertTriangle className="w-5 h-5" />
              ) : (
                <CheckCircle2 className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-mono text-[#8a8f98]">Delay Assessment:</span>
                <Badge variant={isDelayed ? 'red' : 'green'} size="sm">
                  {isDelayed ? 'Potential Delay Risk' : 'On-Time Expected'}
                </Badge>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h2 className="text-[32px] font-[510] font-mono tracking-tight text-[#ffffff] flex items-baseline gap-1.5">
                  <CountUp value={roundedDays} decimals={0} duration={800} />
                  <span className="text-[18px] font-medium text-[#e4f222]">
                    {roundedDays === 1 ? 'Day' : 'Days'}
                  </span>
                </h2>
                <span className="text-[12px] font-mono text-[#8a8f98]">
                  (~{result.predicted_shipping_days.toFixed(1)}d transit)
                </span>
              </div>
            </div>
          </div>

          <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0 border-[#23252a] w-full sm:w-auto">
            <span className="text-[11px] text-[#8a8f98] font-mono block">Variance from Schedule:</span>
            <span
              className={`text-[15px] font-mono font-medium ${
                diffRounded > 0 ? 'text-[#eb5757]' : diffRounded < 0 ? 'text-[#27a644]' : 'text-[#8a8f98]'
              }`}
            >
              {diffRounded > 0
                ? `+${diffRounded} ${diffRounded === 1 ? 'day' : 'days'} late`
                : diffRounded < 0
                ? `${Math.abs(diffRounded)} ${Math.abs(diffRounded) === 1 ? 'day' : 'days'} early`
                : 'On Schedule'}
            </span>
            <span className="text-[11px] text-[#62666d] block font-mono">
              Scheduled: {roundedScheduled} {roundedScheduled === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>

        {/* 🌍 Dark Vector Geodesic Route Visualizer */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono text-[#8a8f98] uppercase tracking-wider">
              Transit Geodesic Arc
            </span>
            <span className="text-[11px] font-mono text-[#62666d]">
              Origin: Caguas SJU-HUB
            </span>
          </div>
          <GeodesicRouteMap
            destination={{
              country: input?.['Order Country'] || 'Alemania',
              state: input?.['Order State'] || '',
              market: input?.Market || '',
              lat: input?.Latitude,
              lon: input?.Longitude,
            }}
          />
        </div>

        {/* Detailed Metrics Breakdown */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-[8px] bg-[rgba(255,255,255,0.02)] border border-[#23252a]">
            <span className="text-[11px] text-[#8a8f98] font-mono block">Fulfillment Tier</span>
            <span className="text-[14px] font-[510] text-[#ffffff] block mt-1">
              {result.speed_category || 'Standard Class'}
            </span>
            <span className="text-[11px] text-[#62666d] mt-0.5 block">{result.description}</span>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[rgba(255,255,255,0.02)] border border-[#23252a]">
            <span className="text-[11px] text-[#8a8f98] font-mono block">Destination Market</span>
            <span className="text-[14px] font-[510] text-[#ffffff] block mt-1">
              {input?.Market} → {input?.['Order Country']}
            </span>
            <span className="text-[11px] text-[#62666d] mt-0.5 block truncate">
              {input?.['Order State']}, {input?.['Order Region']}
            </span>
          </div>

          <div className="p-3.5 rounded-[8px] bg-[rgba(255,255,255,0.02)] border border-[#23252a]">
            <span className="text-[11px] text-[#8a8f98] font-mono block">Order Profile</span>
            <span className="text-[14px] font-[510] text-[#ffffff] block mt-1">
              {input?.['Category Name']}
            </span>
            <span className="text-[11px] text-[#62666d] mt-0.5 block">
              Qty: {input?.['Order Item Quantity']} • ${input?.Sales?.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Delivery Window Overview */}
        <div className="p-3.5 rounded-[8px] bg-[#161718] border border-[#23252a] text-[12px] text-[#8a8f98] flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#27a644] flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-[#ffffff] font-medium">Delivery Window Overview</p>
            <p className="text-[#8a8f98] leading-relaxed">
              {result.disclaimer ||
                'This estimated delivery window is calculated based on carrier service level, destination geography, and historical transit data. Transit times are intended for delivery planning and may vary with weather or customs clearance.'}
            </p>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#23252a]">
          <Button
            variant="outline"
            size="md"
            onClick={() => {
              onClose();
              navigate('/history');
            }}
            icon={<ArrowRight className="w-3.5 h-3.5" />}
          >
            View in Prediction History
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={() => {
              onReset();
              onClose();
            }}
            icon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Predict Another Shipment
          </Button>
        </div>
      </div>
    </Modal>
  );
};
