import React, { useState, useRef, useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  spotlight?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  variant = 'default',
  padding = 'md',
  spotlight = true,
  onMouseMove,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (spotlight && cardRef.current) {
        const rect = cardRef.current.getBoundingClientRect();
        setMousePos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
        });
      }
      onMouseMove?.(e);
    },
    [spotlight, onMouseMove]
  );

  const handleMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (spotlight) setIsHovered(true);
      onMouseEnter?.(e);
    },
    [spotlight, onMouseEnter]
  );

  const handleMouseLeave = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (spotlight) setIsHovered(false);
      onMouseLeave?.(e);
    },
    [spotlight, onMouseLeave]
  );

  const variants = {
    default: 'bg-[#0f1011] border border-[#23252a] rounded-[12px]',
    elevated: 'bg-[#161718] border border-[#383b3f] rounded-[12px] shadow-[0_4px_24px_rgba(0,0,0,0.5)]',
    subtle: 'bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.06)] rounded-[8px]',
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-3 sm:p-4',
    md: 'p-5 sm:p-6',
    lg: 'p-6 sm:p-8',
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={twMerge(
        clsx(
          variants[variant],
          paddings[padding],
          'relative overflow-hidden transition-colors group',
          className
        )
      )}
      {...props}
    >
      {/* Linear-Style Radial Cursor Spotlight */}
      {spotlight && isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-[inherit] transition-opacity duration-300 z-0 border border-[rgba(228,242,34,0.15)]"
          style={{
            background: `radial-gradient(350px circle at ${mousePos.x}px ${mousePos.y}px, rgba(228, 242, 34, 0.04), transparent 80%)`,
            maskImage: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent 100%)`,
            WebkitMaskImage: `radial-gradient(280px circle at ${mousePos.x}px ${mousePos.y}px, black, transparent 100%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
