import React, { useMemo } from 'react';
import { Badge } from '../ui/Badge';
import { Compass, Globe2 } from 'lucide-react';

export interface GeodesicRouteMapProps {
  origin?: {
    name: string;
    lat: number;
    lon: number;
    code: string;
  };
  destination?: {
    country: string;
    state?: string;
    market?: string;
    lat?: number;
    lon?: number;
  };
  className?: string;
}

// Default DataCo primary supply chain fulfillment hub in Puerto Rico
const DEFAULT_ORIGIN = {
  name: 'Caguas Logistics Center, PR',
  code: 'SJU-HUB',
  lat: 18.2288,
  lon: -66.0395,
};

// Approximate geographic coordinates for destination countries/markets
const DESTINATION_COORDS: Record<string, { lat: number; lon: number; code: string }> = {
  // Europe
  Alemania: { lat: 51.1657, lon: 10.4515, code: 'FRA-DE' },
  Francia: { lat: 46.2276, lon: 2.2137, code: 'CDG-FR' },
  'United Kingdom': { lat: 55.3781, lon: -3.436, code: 'LHR-GB' },
  Italia: { lat: 41.8719, lon: 12.5674, code: 'FCO-IT' },
  España: { lat: 40.4637, lon: -3.7492, code: 'MAD-ES' },
  Holanda: { lat: 52.1326, lon: 5.2913, code: 'AMS-NL' },
  Bélgica: { lat: 50.5039, lon: 4.4699, code: 'BRU-BE' },
  Austria: { lat: 47.5162, lon: 14.5501, code: 'VIE-AT' },
  // LATAM
  Brasil: { lat: -14.235, lon: -51.9253, code: 'GRU-BR' },
  México: { lat: 23.6345, lon: -102.5528, code: 'MEX-MX' },
  Colombia: { lat: 4.5709, lon: -74.2973, code: 'BOG-CO' },
  Argentina: { lat: -38.4161, lon: -63.6167, code: 'EZE-AR' },
  Chile: { lat: -35.6751, lon: -71.543, code: 'SCL-CL' },
  Perú: { lat: -9.19, lon: -75.0152, code: 'LIM-PE' },
  // USCA
  'Estados Unidos': { lat: 37.0902, lon: -95.7129, code: 'ORD-US' },
  Canadá: { lat: 56.1304, lon: -106.3468, code: 'YYZ-CA' },
  // Pacific Asia
  Australia: { lat: -25.2744, lon: 133.7751, code: 'SYD-AU' },
  China: { lat: 35.8617, lon: 104.1954, code: 'PVG-CN' },
  Japón: { lat: 36.2048, lon: 138.2529, code: 'HND-JP' },
  India: { lat: 20.5937, lon: 78.9629, code: 'DEL-IN' },
  Singapur: { lat: 1.3521, lon: 103.8198, code: 'SIN-SG' },
  // Africa
  Egipto: { lat: 26.8206, lon: 30.8025, code: 'CAI-EG' },
  Nigeria: { lat: 9.082, lon: 8.6753, code: 'LOS-NG' },
  Sudáfrica: { lat: -30.5595, lon: 22.9375, code: 'JNB-ZA' },
  Marruecos: { lat: 31.7917, lon: -7.0926, code: 'CMN-MA' },
};

// Haversine formula calculation for geodesic great-circle distance
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in kilometers
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const km = Math.round(R * c);
  const miles = Math.round(km * 0.621371);
  return { km, miles };
}

// Project coordinates (lat, lon) to SVG viewBox (800 x 360)
function project(lat: number, lon: number, width = 800, height = 360) {
  const x = ((lon + 180) / 360) * width;
  // Mercator-like vertical scaling clamped to readable range
  const clampedLat = Math.max(-65, Math.min(75, lat));
  const y = ((75 - clampedLat) / 140) * height;
  return { x: Math.round(x), y: Math.round(y) };
}

export const GeodesicRouteMap: React.FC<GeodesicRouteMapProps> = ({
  origin = DEFAULT_ORIGIN,
  destination,
  className = '',
}) => {
  const destCountry = destination?.country || 'Alemania';
  const destInfo =
    DESTINATION_COORDS[destCountry] ||
    (destination?.lat && destination?.lon
      ? { lat: destination.lat, lon: destination.lon, code: 'DST-HUB' }
      : { lat: 51.1657, lon: 10.4515, code: 'EUR-HUB' });

  // Compute points and curve
  const { p1, p2, arcPath, distance, timeDiffHours } = useMemo(() => {
    const originPt = project(origin.lat, origin.lon);
    const destPt = project(destInfo.lat, destInfo.lon);

    // Quadratic Bézier control point arched upward toward northern hemisphere
    const midX = (originPt.x + destPt.x) / 2;
    const midY = (originPt.y + destPt.y) / 2;
    const dx = destPt.x - originPt.x;
    const dy = destPt.y - originPt.y;
    const chordLen = Math.sqrt(dx * dx + dy * dy);

    // Arc curvature proportional to distance
    const archAltitude = Math.min(90, Math.max(35, chordLen * 0.22));
    const controlY = Math.max(20, midY - archAltitude);

    const path = `M ${originPt.x} ${originPt.y} Q ${midX} ${controlY} ${destPt.x} ${destPt.y}`;
    const dist = calculateHaversineDistance(origin.lat, origin.lon, destInfo.lat, destInfo.lon);

    // Approximate timezone hour offset based on 15 degrees longitude per hour
    const diffHours = Math.round((destInfo.lon - origin.lon) / 15);

    return {
      p1: originPt,
      p2: destPt,
      arcPath: path,
      distance: dist,
      timeDiffHours: diffHours,
    };
  }, [origin, destInfo]);

  return (
    <div
      className={`rounded-[10px] bg-[#08090a] border border-[#23252a] overflow-hidden flex flex-col ${className}`}
    >
      {/* Top Map HUD Bar */}
      <div className="px-4 py-2.5 bg-[#0f1011] border-b border-[#23252a] flex items-center justify-between text-[11px] font-mono flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Globe2 className="w-3.5 h-3.5 text-[#02b8cc]" />
          <span className="text-[#ffffff] font-medium">GEODESIC TRANSIT CORRIDOR</span>
          <span className="text-[#62666d]">|</span>
          <span className="text-[#8a8f98]">
            {origin.code} → {destInfo.code}
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#8a8f98]">
          <span className="flex items-center gap-1">
            <Compass className="w-3 h-3 text-[#e4f222]" />
            <strong className="text-[#ffffff]">{distance.km.toLocaleString()} km</strong> (
            {distance.miles.toLocaleString()} mi)
          </span>
          <span>•</span>
          <span className="text-[#38bdf8]">
            {timeDiffHours >= 0 ? `+${timeDiffHours}h` : `${timeDiffHours}h`} Shift
          </span>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="relative w-full h-44 sm:h-52 bg-[#08090a]">
        <svg
          viewBox="0 0 800 360"
          className="w-full h-full object-cover select-none"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            {/* Glow Filter */}
            <filter id="arcGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>

            {/* Linear Gradient for Arc */}
            <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#02b8cc" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#e4f222" stopOpacity="1" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.9" />
            </linearGradient>
          </defs>

          {/* Latitude & Longitude Coordinate Grid Lines */}
          <g stroke="#161718" strokeWidth="0.8" opacity="0.6">
            <line x1="0" y1="90" x2="800" y2="90" />
            <line x1="0" y1="180" x2="800" y2="180" stroke="#23252a" strokeDasharray="3,3" />
            <line x1="0" y1="270" x2="800" y2="270" />
            <line x1="200" y1="0" x2="200" y2="360" />
            <line x1="400" y1="0" x2="400" y2="360" stroke="#23252a" strokeDasharray="3,3" />
            <line x1="600" y1="0" x2="600" y2="360" />
          </g>

          {/* Minimalist Vector Landmass Outlines */}
          <g fill="#111315" stroke="#1f2227" strokeWidth="0.75" opacity="0.85">
            {/* North America */}
            <path d="M 80,60 L 140,40 L 220,50 L 230,95 L 180,120 L 160,170 L 120,160 L 90,120 Z" />
            {/* South America */}
            <path d="M 190,180 L 250,200 L 270,260 L 220,330 L 190,260 Z" />
            {/* Europe */}
            <path d="M 380,50 L 460,45 L 480,95 L 440,120 L 370,110 Z" />
            {/* Africa */}
            <path d="M 370,130 L 470,130 L 490,200 L 440,290 L 380,240 Z" />
            {/* Asia */}
            <path d="M 480,50 L 680,60 L 710,130 L 590,170 L 510,120 Z" />
            {/* Australia */}
            <path d="M 640,230 L 730,240 L 710,310 L 630,290 Z" />
          </g>

          {/* Great Circle Flight Path Curve (Glow Shadow) */}
          <path
            d={arcPath}
            fill="none"
            stroke="#e4f222"
            strokeWidth="3.5"
            strokeOpacity="0.15"
            filter="url(#arcGlow)"
          />

          {/* Great Circle Flight Path Curve (Primary Line) */}
          <path
            d={arcPath}
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="1.8"
            strokeDasharray="5,4"
            className="animate-[dash_20s_linear_infinite]"
          />

          {/* Origin Radar & Marker (Caguas Hub) */}
          <g transform={`translate(${p1.x}, ${p1.y})`}>
            <circle r="9" fill="#02b8cc" fillOpacity="0.15" className="animate-ping" />
            <circle r="4" fill="#02b8cc" stroke="#08090a" strokeWidth="1.5" />
            <text
              x="8"
              y="-6"
              fill="#02b8cc"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="bold"
            >
              PR HUB
            </text>
          </g>

          {/* Destination Radar & Marker */}
          <g transform={`translate(${p2.x}, ${p2.y})`}>
            <circle r="11" fill="#e4f222" fillOpacity="0.2" className="animate-ping" />
            <circle r="4.5" fill="#e4f222" stroke="#08090a" strokeWidth="1.5" />
            <text
              x="8"
              y="-6"
              fill="#ffffff"
              fontSize="9.5"
              fontFamily="monospace"
              fontWeight="bold"
            >
              {destCountry.toUpperCase()}
            </text>
          </g>
        </svg>
      </div>

      {/* Bottom Telemetry Metrics Strip */}
      <div className="px-4 py-2 bg-[#0f1011] border-t border-[#23252a] grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
        <div>
          <span className="text-[#62666d] block text-[9.5px]">FULFILLMENT ORIGIN</span>
          <span className="text-[#02b8cc] font-medium">{origin.name}</span>
        </div>
        <div>
          <span className="text-[#62666d] block text-[9.5px]">TRANSIT DESTINATION</span>
          <span className="text-[#ffffff] font-medium">
            {destCountry} {destination?.state ? `(${destination.state})` : ''}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 flex items-center sm:justify-end gap-2">
          <Badge variant="lime" size="sm">
            Active Geodesic Vector
          </Badge>
        </div>
      </div>
    </div>
  );
};
