import React from 'react';

export interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
  };

  const textSizes = {
    sm: 'text-[13px]',
    md: 'text-[15px]',
    lg: 'text-[18px]',
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Precision Isometric Vector Mark */}
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes[size]} flex-shrink-0 transition-transform duration-200 group-hover:scale-105`}
      >
        <defs>
          {/* Velocity Gradient */}
          <linearGradient id="sf-grad" x1="5" y1="24" x2="27" y2="7" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#02b8cc" />
            <stop offset="60%" stopColor="#e4f222" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Badge Background Gradient */}
          <linearGradient id="sf-box-bg" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#181a1d" />
            <stop offset="100%" stopColor="#090a0c" />
          </linearGradient>
        </defs>

        {/* Outer Squircle Container Frame */}
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="7"
          fill="url(#sf-box-bg)"
          stroke="#262930"
          strokeWidth="1.2"
        />

        {/* Isometric 3D Freight Container Faces */}
        {/* Top Facet */}
        <path
          d="M 16 6.5 L 23.5 10.8 L 16 15 L 8.5 10.8 Z"
          fill="#1c2026"
          stroke="#383d47"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        {/* Left Shadow Facet */}
        <path
          d="M 8.5 10.8 L 16 15 L 16 23.5 L 8.5 19.3 Z"
          fill="#101215"
          stroke="#383d47"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />
        {/* Right Facet */}
        <path
          d="M 16 15 L 23.5 10.8 L 23.5 19.3 L 16 23.5 Z"
          fill="#15171c"
          stroke="#383d47"
          strokeWidth="0.9"
          strokeLinejoin="round"
        />

        {/* Dynamic Forward Geodesic Vector Trail */}
        <path
          d="M 6.5 22.5 Q 12.5 19 16 12.5 T 25.5 8"
          stroke="url(#sf-grad)"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* Origin Hub Pulse Node */}
        <circle cx="6.5" cy="22.5" r="1.5" fill="#02b8cc" />

        {/* Destination Target Pulse Node */}
        <circle cx="25.5" cy="8" r="2.2" fill="#e4f222" />
        <circle cx="25.5" cy="8" r="4.2" stroke="#e4f222" strokeWidth="0.75" opacity="0.6" />
      </svg>

      {/* Brand Typography */}
      {showText && (
        <div className="flex items-baseline">
          <span className={`${textSizes[size]} font-[510] text-[#ffffff] tracking-tight`}>
            Smart
          </span>
          <span className={`${textSizes[size]} font-normal text-[#8a8f98] tracking-tight ml-0.5`}>
            Freight
          </span>
        </div>
      )}
    </div>
  );
};
