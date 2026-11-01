import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  helperText?: string;
  placeholder?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  helperText,
  placeholder = 'Select an option...',
  className,
  id,
  value,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-[12px] font-medium text-[#8a8f98] tracking-tight"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          value={value}
          className={twMerge(
            clsx(
              'w-full appearance-none bg-[#0f1011] border border-[#23252a] text-[#ffffff] rounded-[6px] pl-3 pr-8 py-2 text-[13px] transition-all duration-150 cursor-pointer',
              'focus:outline-none focus:border-[#d0d6e0] focus:ring-1 focus:ring-[#d0d6e0]/30',
              !value && 'text-[#62666d]',
              error && 'border-[#eb5757] focus:border-[#eb5757] focus:ring-[#eb5757]/20',
              className
            )
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled className="bg-[#0f1011] text-[#62666d]">
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-[#0f1011] text-[#ffffff]">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#8a8f98]">
          <ChevronDown className="w-4 h-4 opacity-70" />
        </div>
      </div>
      {error ? (
        <p className="text-[11px] text-[#eb5757] tracking-tight">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-[#62666d] tracking-tight">{helperText}</p>
      ) : null}
    </div>
  );
};

