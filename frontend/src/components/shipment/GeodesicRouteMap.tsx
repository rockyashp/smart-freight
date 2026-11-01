import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import { Badge } from '../ui/Badge';
import { Compass, Globe2, MapPin } from 'lucide-react';

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
  Polonia: { lat: 51.9194, lon: 19.1451, code: 'WAW-PL' },
  Suiza: { lat: 46.8182, lon: 8.2275, code: 'ZRH-CH' },
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

// State-level coordinates for higher precision
const STATE_COORDS: Record<string, { lat: number; lon: number }> = {
  Bavaria: { lat: 48.7904, lon: 11.4979 },
  Berlin: { lat: 52.52, lon: 13.405 },
  'Sao Paulo': { lat: -23.5505, lon: -46.6333 },
  'Rio de Janeiro': { lat: -22.9068, lon: -43.1729 },
  'New York': { lat: 40.7128, lon: -74.006 },
  California: { lat: 36.7783, lon: -119.4179 },
  Texas: { lat: 31.9686, lon: -99.9018 },
  Illinois: { lat: 40.6331, lon: -89.3985 },
};

// Spherical Haversine calculation
function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth radius in km
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

// Generate intermediate Great Circle points between two coordinates
function generateGreatCirclePoints(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  numPoints = 50
): [number, number][] {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const toDeg = (rad: number) => (rad * 180) / Math.PI;

  const rlat1 = toRad(lat1);
  const rlon1 = toRad(lon1);
  const rlat2 = toRad(lat2);
  const rlon2 = toRad(lon2);

  // Angular distance between points
  const d =
    2 *
    Math.asin(
      Math.sqrt(
        Math.pow(Math.sin((rlat1 - rlat2) / 2), 2) +
          Math.cos(rlat1) * Math.cos(rlat2) * Math.pow(Math.sin((rlon1 - rlon2) / 2), 2)
      )
    );

  if (d === 0) return [[lat1, lon1]];

  const points: [number, number][] = [];
  for (let i = 0; i <= numPoints; i++) {
    const f = i / numPoints;
    const A = Math.sin((1 - f) * d) / Math.sin(d);
    const B = Math.sin(f * d) / Math.sin(d);

    const x = A * Math.cos(rlat1) * Math.cos(rlon1) + B * Math.cos(rlat2) * Math.cos(rlon2);
    const y = A * Math.cos(rlat1) * Math.sin(rlon1) + B * Math.cos(rlat2) * Math.sin(rlon2);
    const z = A * Math.sin(rlat1) + B * Math.sin(rlat2);

    const lat = toDeg(Math.atan2(z, Math.sqrt(x * x + y * y)));
    const lon = toDeg(Math.atan2(y, x));
    points.push([lat, lon]);
  }

  return points;
}

export const GeodesicRouteMap: React.FC<GeodesicRouteMapProps> = ({
  origin = DEFAULT_ORIGIN,
  destination,
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const layerGroupRef = useRef<L.LayerGroup | null>(null);

  const [mapTheme, setMapTheme] = useState<'dark' | 'osm'>('dark');

  // Resolve destination coordinate
  const destCountry = destination?.country || 'Alemania';
  const destState = destination?.state;

  const destInfo = useMemo(() => {
    if (destState && STATE_COORDS[destState]) {
      return {
        lat: STATE_COORDS[destState].lat,
        lon: STATE_COORDS[destState].lon,
        code: DESTINATION_COORDS[destCountry]?.code || 'DST-LOC',
      };
    }
    if (destination?.lat && destination?.lon) {
      return {
        lat: destination.lat,
        lon: destination.lon,
        code: 'DST-LOC',
      };
    }
    return (
      DESTINATION_COORDS[destCountry] || {
        lat: 51.1657,
        lon: 10.4515,
        code: 'EUR-HUB',
      }
    );
  }, [destCountry, destState, destination]);

  // Distance and timezone offset
  const { distance, timeDiffHours } = useMemo(() => {
    const dist = calculateHaversineDistance(origin.lat, origin.lon, destInfo.lat, destInfo.lon);
    const diffHours = Math.round((destInfo.lon - origin.lon) / 15);
    return { distance: dist, timeDiffHours: diffHours };
  }, [origin, destInfo]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [30, -20],
        zoom: 3,
        zoomControl: true,
        attributionControl: true,
        scrollWheelZoom: false,
      });

      // Layer group for route polylines and markers
      const layerGroup = L.layerGroup().addTo(map);
      layerGroupRef.current = layerGroup;

      // Official OpenStreetMap tile layer (100% Free, Zero API Key Required)
      const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);
      tileLayerRef.current = osmLayer;

      mapInstanceRef.current = map;
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle Theme Switching: Dark Inversion Filter vs Standard OpenStreetMap
  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapTheme === 'dark') {
      container.classList.add('dark-map-tiles');
    } else {
      container.classList.remove('dark-map-tiles');
    }
  }, [mapTheme]);

  // Render Geodesic Flight Path & Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layerGroupRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    // 1. Compute Great Circle path points
    const arcPoints = generateGreatCirclePoints(origin.lat, origin.lon, destInfo.lat, destInfo.lon, 60);

    // 2. Glow Polyline (outer corridor shadow)
    const glowPath = L.polyline(arcPoints, {
      color: '#e4f222',
      weight: 6,
      opacity: 0.25,
      lineCap: 'round',
    });
    layerGroup.addLayer(glowPath);

    // 3. Primary Geodesic Trajectory Polyline
    const routePath = L.polyline(arcPoints, {
      color: '#e4f222',
      weight: 2.5,
      opacity: 0.95,
      dashArray: '8, 6',
      lineCap: 'round',
    });
    layerGroup.addLayer(routePath);

    // 4. Origin Marker (Caguas, Puerto Rico)
    const originIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div style="position: relative; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 24px; height: 24px; border-radius: 50%; background: rgba(2, 184, 204, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 12px; height: 12px; border-radius: 50%; background: #02b8cc; border: 2px solid #08090a; box-shadow: 0 0 10px #02b8cc;"></div>
          <div style="position: absolute; top: -22px; left: 50%; transform: translateX(-50%); background: #0f1011; border: 1px solid #23252a; color: #02b8cc; font-family: monospace; font-size: 10px; font-weight: bold; padding: 1px 6px; border-radius: 4px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
            SJU-HUB
          </div>
        </div>
      `,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    const originMarker = L.marker([origin.lat, origin.lon], { icon: originIcon });
    originMarker.bindPopup(`
      <div style="font-family: monospace; font-size: 11px; color: #ffffff; background: #0f1011; padding: 4px 6px; border-radius: 4px;">
        <strong style="color: #02b8cc;">Origin Fulfillment Hub</strong><br/>
        ${origin.name}<br/>
        Coord: ${origin.lat.toFixed(3)}, ${origin.lon.toFixed(3)}
      </div>
    `);
    layerGroup.addLayer(originMarker);

    // 5. Destination Marker
    const destIcon = L.divIcon({
      className: 'bg-transparent',
      html: `
        <div style="position: relative; width: 22px; height: 22px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 28px; height: 28px; border-radius: 50%; background: rgba(228, 242, 34, 0.4); animation: ping 1.8s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 14px; height: 14px; border-radius: 50%; background: #e4f222; border: 2px solid #08090a; box-shadow: 0 0 12px #e4f222;"></div>
          <div style="position: absolute; top: -22px; left: 50%; transform: translateX(-50%); background: #0f1011; border: 1px solid #23252a; color: #ffffff; font-family: monospace; font-size: 10px; font-weight: bold; padding: 1px 6px; border-radius: 4px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.6);">
            ${destCountry.toUpperCase()}
          </div>
        </div>
      `,
      iconSize: [22, 22],
      iconAnchor: [11, 11],
    });

    const destMarker = L.marker([destInfo.lat, destInfo.lon], { icon: destIcon });
    destMarker.bindPopup(`
      <div style="font-family: monospace; font-size: 11px; color: #ffffff; background: #0f1011; padding: 4px 6px; border-radius: 4px;">
        <strong style="color: #e4f222;">Delivery Destination</strong><br/>
        ${destCountry} ${destState ? `(${destState})` : ''}<br/>
        Coord: ${destInfo.lat.toFixed(3)}, ${destInfo.lon.toFixed(3)}
      </div>
    `);
    layerGroup.addLayer(destMarker);

    // 6. Smoothly auto-fit bounds with padding
    const bounds = L.latLngBounds([
      [origin.lat, origin.lon],
      [destInfo.lat, destInfo.lon],
    ]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 6 });
  }, [origin, destInfo, destCountry, destState]);

  return (
    <div
      className={`rounded-[12px] bg-[#08090a] border border-[#23252a] overflow-hidden flex flex-col shadow-2xl ${className}`}
    >
      {/* Top Map HUD Bar */}
      <div className="px-4 py-2.5 bg-[#0f1011] border-b border-[#23252a] flex items-center justify-between text-[11px] font-mono flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Globe2 className="w-3.5 h-3.5 text-[#02b8cc]" />
          <span className="text-[#ffffff] font-medium tracking-wide">
            GLOBAL TRANSIT CORRIDOR
          </span>
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

          {/* Map Layer Switcher: Dark vs Standard */}
          <div className="flex items-center ml-1 rounded-[5px] bg-[#161718] border border-[#23252a] p-0.5">
            <button
              type="button"
              onClick={() => setMapTheme('dark')}
              className={`px-2 py-0.5 rounded-[4px] text-[10px] font-medium transition-colors cursor-pointer ${
                mapTheme === 'dark'
                  ? 'bg-[#e4f222] text-[#08090a]'
                  : 'text-[#8a8f98] hover:text-[#ffffff]'
              }`}
              title="Dark theme map"
            >
              Dark Map
            </button>
            <button
              type="button"
              onClick={() => setMapTheme('osm')}
              className={`px-2 py-0.5 rounded-[4px] text-[10px] font-medium transition-colors cursor-pointer ${
                mapTheme === 'osm'
                  ? 'bg-[#e4f222] text-[#08090a]'
                  : 'text-[#8a8f98] hover:text-[#ffffff]'
              }`}
              title="Standard daylight map"
            >
              Standard Map
            </button>
          </div>
        </div>
      </div>

      {/* Leaflet Real OpenStreetMap Container */}
      <div className="relative w-full h-56 sm:h-72 bg-[#08090a]">
        <div ref={mapContainerRef} className="w-full h-full z-0 select-none dark-map-tiles" />
      </div>

      {/* Bottom Telemetry Metrics Strip */}
      <div className="px-4 py-2.5 bg-[#0f1011] border-t border-[#23252a] grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono">
        <div>
          <span className="text-[#62666d] block text-[9.5px]">FULFILLMENT ORIGIN</span>
          <span className="text-[#02b8cc] font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {origin.name}
          </span>
        </div>
        <div>
          <span className="text-[#62666d] block text-[9.5px]">TRANSIT DESTINATION</span>
          <span className="text-[#ffffff] font-medium flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#e4f222]" />
            {destCountry} {destState ? `(${destState})` : ''}
          </span>
        </div>
        <div className="col-span-2 sm:col-span-1 flex items-center sm:justify-end gap-2">
          <Badge variant="lime" size="sm">
            Optimal Transit Route
          </Badge>
        </div>
      </div>
    </div>
  );
};
