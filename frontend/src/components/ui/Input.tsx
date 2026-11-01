import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  className,
  id,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-[12px] font-medium text-[#8a8f98] tracking-tight"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {icon && (
          <div className="absolute left-3 text-[#8a8f98] pointer-events-none flex items-center">
            {icon}
          </div>
        )}
        <input
          id={inputId}
          className={twMerge(
            clsx(
              'w-full bg-[rgba(255,255,255,0.02)] border border-[#23252a] text-[#ffffff] rounded-[6px] px-3 py-2 text-[13px] placeholder:text-[#62666d] transition-all duration-150',
              'focus:outline-none focus:border-[#d0d6e0] focus:ring-1 focus:ring-[#d0d6e0]/30',
              icon && 'pl-9',
              error && 'border-[#eb5757] focus:border-[#eb5757] focus:ring-[#eb5757]/20',
              className
            )
          )}
          {...props}
        />
      </div>
      {error ? (
        <p className="text-[11px] text-[#eb5757] tracking-tight">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#62666d] tracking-tight">{helperText}</p>
      ) : null}
    </div>
  );
};

