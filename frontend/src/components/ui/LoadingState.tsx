import React from 'react';

export interface LoadingStateProps {
  message?: string;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Loading intelligence data...',
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 text-center ${className}`}>
      <div className="relative w-8 h-8 mb-4">
        <div className="absolute inset-0 rounded-full border border-[#23252a]" />
        <div className="absolute inset-0 rounded-full border-t border-[#e4f222] animate-spin" />
      </div>
      <p className="text-[13px] text-[#8a8f98] font-mono tracking-tight">{message}</p>
    </div>
  );
};

