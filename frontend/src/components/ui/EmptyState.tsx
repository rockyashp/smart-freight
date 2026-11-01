import React from 'react';
import { Button } from './Button';
import { Inbox } from 'lucide-react';

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon = <Inbox className="w-8 h-8 text-[#8a8f98] opacity-60" />,
  actionLabel,
  onAction,
  className,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-[12px] border border-dashed border-[#23252a] bg-[#0f1011]/50 ${className || ''}`}
    >
      <div className="w-12 h-12 rounded-full bg-[rgba(255,255,255,0.03)] border border-[#23252a] flex items-center justify-center mb-3.5">
        {icon}
      </div>
      <h3 className="text-[15px] font-[510] text-[#ffffff] tracking-tight mb-1">{title}</h3>
      <p className="text-[13px] text-[#8a8f98] max-w-sm mb-5 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

