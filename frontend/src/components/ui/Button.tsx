import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost' | 'pill' | 'white';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className,
  variant = 'outline',
  size = 'md',
  icon,
  loading = false,
  disabled,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer';

  const variants = {
    // Acid Lime primary action: high-contrast, solitary chromatic button
    primary: 'bg-[#e4f222] text-[#08090a] hover:bg-[#d5e31e] font-[510] tracking-[-0.011em] shadow-[0_1px_2px_rgba(0,0,0,0.5)] active:translate-y-[0.5px]',
    // Ghost / Outline button: transparent with graphite border
    outline: 'bg-transparent border border-[#23252a] text-[#d0d6e0] hover:text-[#ffffff] hover:border-[#383b3f] hover:bg-[#161718] active:bg-[#0f1011]',
    // Ghost: pure text button
    ghost: 'bg-transparent text-[#8a8f98] hover:text-[#ffffff] hover:bg-[rgba(255,255,255,0.04)]',
    // Pill button: tag chips and status triggers
    pill: 'bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] text-[#d0d6e0] hover:text-[#ffffff] hover:bg-[rgba(255,255,255,0.08)] rounded-full',
    // Neutral white pill button
    white: 'bg-[#ffffff] text-[#08090a] hover:bg-[#e5e5e6] font-[510] rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.4)]',
  };

  const sizes = {
    sm: 'text-[12px] px-2.5 py-1 gap-1.5 rounded-[6px]',
    md: 'text-[13px] px-3.5 py-2 gap-2 rounded-[6px]',
    lg: 'text-[14px] px-4 py-2.5 gap-2.5 rounded-[6px]',
  };

  const isPill = variant === 'pill' || variant === 'white';
  const radiusClass = isPill ? 'rounded-full' : sizes[size].split(' ').find(c => c.startsWith('rounded-'));

  return (
    <button
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          radiusClass,
          className
        )
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : icon ? (
        <span className="flex-shrink-0 flex items-center">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  );
};

