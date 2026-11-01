import React from 'react';
import { Card } from './Card';
import { CountUp } from './CountUp';
import { clsx } from 'clsx';

export interface StatCardProps {
  label: string;
  value: string | number;
  numericValue?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  subtext?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  numericValue,
  decimals,
  prefix = '',
  suffix = '',
  subtext,
  badge,
  icon,
  trend,
  className,
}) => {
  const isNumeric = typeof numericValue === 'number' || typeof value === 'number';
  const targetNumber = numericValue ?? (typeof value === 'number' ? value : null);

  return (
    <Card className={clsx('flex flex-col justify-between hover:border-[#383b3f] transition-colors', className)}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[12px] font-medium text-[#8a8f98] tracking-tight">{label}</span>
        {icon && <span className="text-[#8a8f98]">{icon}</span>}
        {badge && <div>{badge}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-[26px] font-[510] text-[#ffffff] font-mono tracking-tight">
          {isNumeric && targetNumber !== null ? (
            <CountUp
              value={targetNumber}
              decimals={decimals !== undefined ? decimals : targetNumber % 1 !== 0 ? 1 : 0}
              prefix={prefix}
              suffix={suffix}
            />
          ) : (
            value
          )}
        </span>
        {trend && (
          <span
            className={clsx(
              'text-[11px] font-mono font-medium',
              trend.isPositive ? 'text-[#27a644]' : 'text-[#eb5757]'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-1.5 text-[12px] text-[#62666d] tracking-tight line-clamp-1">{subtext}</p>
      )}
    </Card>
  );
};

