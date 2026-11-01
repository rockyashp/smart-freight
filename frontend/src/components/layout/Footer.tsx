import React, { useEffect, useState } from 'react';
import { analyticsService } from '../../services/analyticsService';
import { BrandLogo } from '../ui/BrandLogo';
import { ShieldCheck, Database, Cpu } from 'lucide-react';

export const Footer: React.FC = () => {
  const [healthStatus, setHealthStatus] = useState<'ok' | 'degraded' | 'checking'>('checking');

  useEffect(() => {
    analyticsService
      .getHealth()
      .then((res) => {
        setHealthStatus(res.status === 'ok' ? 'ok' : 'degraded');
      })
      .catch(() => {
        setHealthStatus('degraded');
      });
  }, []);

  return (
    <footer className="w-full border-t border-[#23252a] bg-[#08090a] py-8 mt-20">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-[#62666d]">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" showText={true} />
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                healthStatus === 'ok'
                  ? 'bg-[#27a644]'
                  : healthStatus === 'degraded'
                  ? 'bg-[#eb5757]'
                  : 'bg-[#e4f222]'
              }`}
            />
            {healthStatus === 'ok' ? 'System Operational' : healthStatus === 'degraded' ? 'Backend Degraded' : 'Checking Health'}
          </span>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center text-[#8a8f98]">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#27a644]" />
            Pre-Dispatch Verification
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-[#38bdf8]" />
            Real-Time Transit Analytics
          </span>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-[#a78bfa]" />
            Enterprise Logistics Cloud
          </span>
        </div>

        <div>
          <span>Smart Freight Logistics Platform © {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
};

