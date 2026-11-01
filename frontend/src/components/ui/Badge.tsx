import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'green' | 'red' | 'lime' | 'violet' | 'teal' | 'neutral';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  className,
  variant = 'neutral',
  size = 'md',
  dot = false,
  ...props
}) => {
  const variants = {
    green: 'bg-[#27a644]/10 text-[#27a644] border-[#27a644]/25',
    red: 'bg-[#eb5757]/10 text-[#eb5757] border-[#eb5757]/25',
    lime: 'bg-[#e4f222]/10 text-[#e4f222] border-[#e4f222]/30',
    violet: 'bg-[#6366f1]/10 text-[#a5b4fc] border-[#6366f1]/25',
    teal: 'bg-[#02b8cc]/10 text-[#02b8cc] border-[#02b8cc]/25',
    neutral: 'bg-[rgba(255,255,255,0.04)] text-[#8a8f98] border-[#23252a]',
  };

  const sizes = {
    sm: 'text-[11px] px-1.5 py-0.5 rounded-[4px] gap-1 font-normal',
    md: 'text-[12px] px-2 py-0.5 rounded-[4px] gap-1.5 font-medium',
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center border tracking-tight',
          variants[variant],
          sizes[size],
          className
        )
      )}
      {...props}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            variant === 'green' && 'bg-[#27a644]',
            variant === 'red' && 'bg-[#eb5757]',
            variant === 'lime' && 'bg-[#e4f222]',
            variant === 'violet' && 'bg-[#818cf8]',
            variant === 'teal' && 'bg-[#02b8cc]',
            variant === 'neutral' && 'bg-[#8a8f98]'
          )}
        />
      )}
      <span>{children}</span>
    </span>
  );
};

