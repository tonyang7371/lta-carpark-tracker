import React, { useState, useMemo } from 'react';
import { Carpark, SingaporeRegion, VehicleType } from '../types/carpark';
import { MapPin, Navigation, Zap, Layers, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface InteractiveMapProps {
  carparks: Carpark[];
  selectedCarpark: Carpark | null;
  onSelectCarpark: (carpark: Carpark) => void;
  activeVehicleType: VehicleType;
  selectedRegion: 'All' | SingaporeRegion;
  onSelectRegion: (region: 'All' | SingaporeRegion) => void;
}

// Singapore coordinate bounds for SVG projection
const SG_BOUNDS = {
  minLat: 1.220,
  maxLat: 1.475,
  minLng: 103.600,
  maxLng: 104.040,
};

const SVG_WIDTH = 960;
const SVG_HEIGHT = 560;

function projectCoords(lat: number, lng: number): { x: number; y: number } {
  const x = ((lng - SG_BOUNDS.minLng) / (SG_BOUNDS.maxLng - SG_BOUNDS.minLng)) * SVG_WIDTH;
  const y = ((SG_BOUNDS.maxLat - lat) / (SG_BOUNDS.maxLat - SG_BOUNDS.minLat)) * SVG_HEIGHT;
  return { x, y };
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  carparks,
  selectedCarpark,
  onSelectCarpark,
  activeVehicleType,
  selectedRegion,
  onSelectRegion,
}) => {
  const [hoveredCarpark, setHoveredCarpark] = useState<Carpark | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const regionsList: ('All' | SingaporeRegion)[] = [
    'All',
    'Central / CBD',
    'Orchard & Tanglin',
    'East',
    'West',
    'North',
    'North-East',
  ];

  const filteredCarparks = useMemo(() => {
    if (selectedRegion === 'All') return carparks;
    return carparks.filter((cp) => cp.region === selectedRegion);
  }, [carparks, selectedRegion]);

  // Determine availability status styling
  const getLotStatusColor = (available: number, total: number) => {
    if (total === 0) return { bg: 'bg-neutral-600', ring: 'ring-neutral-500', text: 'text-neutral-300' };
    const pct = (available / total) * 100;
    if (available < 10 || pct < 8) {
      return { bg: 'bg-rose-500', ring: 'ring-rose-400', text: 'text-white' };
    }
    if (available < 40 || pct < 20) {
      return { bg: 'bg-amber-500', ring: 'ring-amber-400', text: 'text-white' };
    }
    return { bg: 'bg-emerald-500', ring: 'ring-emerald-400', text: 'text-white' };
  };

  const handleZoom = (delta: number) => {
    setZoomLevel((prev) => Math.max(0.8, Math.min(2.5, prev + delta)));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    onSelectRegion('All');
  };

  return (
    <div className="relative w-full rounded-2xl border border-slate-800 bg-slate-950 overflow-hidden shadow-2xl">
      {/* Map Control Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 bg-slate-900/90 px-4 py-2.5 backdrop-blur-md">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1 scrollbar-none">
          <span className="text-slate-400 font-medium mr-1.5 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            Districts:
          </span>
          {regionsList.map((region) => (
            <button
              key={region}
              type="button"
              onClick={() => onSelectRegion(region)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
                selectedRegion === region
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {region}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {/* Legend indicators */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400 mr-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Lots &gt; 20%
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Limited (8-20%)
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              Critical (&lt; 8%)
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-lg border border-slate-700/60">
            <button
              type="button"
              title="Zoom In"
              onClick={() => handleZoom(0.25)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Zoom Out"
              onClick={() => handleZoom(-0.25)}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Reset View"
              onClick={handleResetZoom}
              className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-700 rounded transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* SVG Canvas Map */}
      <div className="relative w-full h-[440px] sm:h-[500px] overflow-hidden bg-gradient-to-b from-slate-950 via-[#0d1424] to-[#090d16] select-none">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full h-full object-contain cursor-grab active:cursor-grabbing transition-transform duration-300 ease-out"
          style={{
            transform: `scale(${zoomLevel}) translate(${panOffset.x}px, ${panOffset.y}px)`,
            transformOrigin: '50% 50%',
          }}
        >
          {/* Subtle Grid Lines */}
          <defs>
            <pattern id="sg-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
            <radialGradient id="water-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#020617" stopOpacity="0" />
            </radialGradient>
          </defs>

          <rect width={SVG_WIDTH} height={SVG_HEIGHT} fill="url(#sg-grid)" />
          <circle cx={SVG_WIDTH / 2} cy={SVG_HEIGHT / 2} r={SVG_WIDTH * 0.45} fill="url(#water-glow)" />

          {/* Singapore Main Island & Offshore Islands Vector Outline */}
          <g className="island-group">
            {/* Mainland Singapore Silhouette */}
            <path
              d="M 170,175 
                 C 210,140 260,110 330,95 
                 C 380,85 450,85 520,95 
                 C 590,105 680,120 740,150 
                 C 810,185 860,210 900,240 
                 C 885,270 850,290 800,310 
                 C 740,335 690,340 640,350 
                 C 590,360 550,380 500,390 
                 C 460,398 420,395 380,380 
                 C 340,365 300,355 260,345 
                 C 210,335 170,320 140,290 
                 C 120,270 110,240 120,210 
                 C 130,190 150,180 170,175 Z"
              fill="#1e293b"
              fillOpacity="0.75"
              stroke="#334155"
              strokeWidth="1.5"
              className="transition-colors hover:fill-slate-800"
            />

            {/* Sentosa Island */}
            <path
              d="M 440,410 C 470,415 500,418 520,412 C 510,425 480,428 450,424 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1.2"
            />

            {/* Jurong Island */}
            <path
              d="M 230,370 C 270,365 300,380 290,405 C 270,420 230,410 220,390 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1"
            />

            {/* Pulau Ubin & Tekong (North-East) */}
            <path
              d="M 760,110 C 790,105 820,115 810,125 C 785,130 765,120 760,110 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1"
            />
            <path
              d="M 830,115 C 870,110 890,135 870,150 C 840,155 825,135 830,115 Z"
              fill="#1e293b"
              stroke="#334155"
              strokeWidth="1"
            />

            {/* Major Expressways / Arteries (Subtle Guidelines) */}
            {/* PIE (Pan Island Expressway): Tuas to Changi */}
            <path
              d="M 180,260 Q 360,270 520,260 T 840,230"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1"
              strokeOpacity="0.25"
              strokeDasharray="4 4"
            />
            {/* CTE & AYE */}
            <path
              d="M 480,120 L 490,370"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1"
              strokeOpacity="0.2"
              strokeDasharray="3 3"
            />
            <path
              d="M 250,330 Q 380,350 490,370"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="1"
              strokeOpacity="0.2"
            />

            {/* Region Label Guides */}
            <text x="500" y="375" fill="#64748b" fontSize="11" fontFamily="sans-serif" fontWeight="600" opacity="0.6">
              CENTRAL / CBD
            </text>
            <text x="440" y="305" fill="#64748b" fontSize="10" fontFamily="sans-serif" fontWeight="600" opacity="0.5">
              ORCHARD
            </text>
            <text x="760" y="220" fill="#64748b" fontSize="11" fontFamily="sans-serif" fontWeight="600" opacity="0.6">
              EAST (CHANGI / TAMPINES)
            </text>
            <text x="210" y="270" fill="#64748b" fontSize="11" fontFamily="sans-serif" fontWeight="600" opacity="0.6">
              WEST (JURONG)
            </text>
            <text x="460" y="115" fill="#64748b" fontSize="11" fontFamily="sans-serif" fontWeight="600" opacity="0.6">
              NORTH (WOODLANDS)
            </text>
            <text x="610" y="195" fill="#64748b" fontSize="11" fontFamily="sans-serif" fontWeight="600" opacity="0.6">
              NORTH-EAST (PUNGGOL)
            </text>
          </g>

          {/* Interactive Carpark Lot Pins */}
          {filteredCarparks.map((cp) => {
            const { x, y } = projectCoords(cp.coordinates.lat, cp.coordinates.lng);
            const lotData = cp.lots[activeVehicleType];
            const isSelected = selectedCarpark?.id === cp.id;
            const isHovered = hoveredCarpark?.id === cp.id;
            const statusColor = getLotStatusColor(lotData.available, lotData.total);

            return (
              <g
                key={cp.id}
                transform={`translate(${x}, ${y})`}
                className="cursor-pointer transition-all duration-200"
                onClick={() => onSelectCarpark(cp)}
                onMouseEnter={() => setHoveredCarpark(cp)}
                onMouseLeave={() => setHoveredCarpark(null)}
              >
                {/* Glow ring on selected or hovered */}
                {(isSelected || isHovered) && (
                  <circle
                    r="24"
                    fill={lotData.available < 10 ? '#f43f5e' : '#10b981'}
                    fillOpacity="0.2"
                    className="animate-pulse"
                  />
                )}

                {/* Pin Circle */}
                <circle
                  r={isSelected ? '15' : '12'}
                  fill={lotData.available < 10 ? '#f43f5e' : lotData.available < 40 ? '#f59e0b' : '#10b981'}
                  stroke="#ffffff"
                  strokeWidth={isSelected ? '2.5' : '1.5'}
                  filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                />

                {/* Available lot number inside pin */}
                <text
                  textAnchor="middle"
                  dy="4"
                  fill="#ffffff"
                  fontSize={lotData.available > 999 ? '8' : lotData.available > 99 ? '9' : '10'}
                  fontWeight="700"
                  fontFamily="'JetBrains Mono', monospace"
                  className="pointer-events-none select-none"
                >
                  {lotData.available > 999 ? `${Math.floor(lotData.available / 1000)}k` : lotData.available}
                </text>

                {/* Small EV badge if present */}
                {cp.evChargers && (
                  <circle
                    cx="10"
                    cy="-10"
                    r="4.5"
                    fill="#38bdf8"
                    stroke="#0f172a"
                    strokeWidth="1"
                  />
                )}
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip Overlay */}
        {hoveredCarpark && (
          <div
            className="absolute pointer-events-none z-30 transition-all duration-150 transform -translate-x-1/2 -translate-y-full mb-3"
            style={{
              left: `${projectCoords(hoveredCarpark.coordinates.lat, hoveredCarpark.coordinates.lng).x}px`,
              top: `${projectCoords(hoveredCarpark.coordinates.lat, hoveredCarpark.coordinates.lng).y}px`,
            }}
          >
            <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl px-3.5 py-2.5 shadow-2xl backdrop-blur-md max-w-xs text-left">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-semibold text-white truncate max-w-[180px]">
                  {hoveredCarpark.name}
                </span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {hoveredCarpark.agency}
                </span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 mb-2">
                <span>{hoveredCarpark.nearestMrt}</span>
                <span aria-hidden="true">·</span>
                <span>{hoveredCarpark.carparkType}</span>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 pt-1.5 text-xs">
                <div>
                  <span className="text-slate-400">Available: </span>
                  <span className="font-mono font-bold text-emerald-400">
                    {hoveredCarpark.lots[activeVehicleType].available}
                  </span>
                  <span className="text-slate-400 font-mono"> / {hoveredCarpark.lots[activeVehicleType].total}</span>
                </div>
                {hoveredCarpark.evChargers && (
                  <span className="flex items-center gap-1 text-[11px] text-sky-400 font-mono">
                    <Zap className="w-3 h-3" />
                    {hoveredCarpark.evChargers.available} EV
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Selected Carpark Bottom Sheet / Mini Card */}
        {selectedCarpark && (
          <div className="absolute bottom-3 left-3 right-3 sm:left-4 sm:right-auto sm:max-w-md z-20 bg-slate-900/95 border border-slate-700/80 rounded-xl p-3.5 shadow-2xl backdrop-blur-md animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-sm font-bold text-white line-clamp-1">{selectedCarpark.name}</h4>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {selectedCarpark.id}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <span>{selectedCarpark.district}</span>
                  <span aria-hidden="true">·</span>
                  <span>MRT: {selectedCarpark.nearestMrt}</span>
                  <span aria-hidden="true">·</span>
                  <span>Limit {selectedCarpark.heightLimitMeters}m</span>
                </div>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedCarpark.coordinates.lat},${selectedCarpark.coordinates.lng}`}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Navigation className="w-3 h-3" />
                Go
              </a>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-800 text-center">
              <div className="bg-slate-800/60 rounded-lg p-1.5">
                <span className="block text-[10px] text-slate-400 uppercase">Cars</span>
                <span className="font-mono text-sm font-bold text-emerald-400">
                  {selectedCarpark.lots.car.available}
                </span>
                <span className="text-[10px] text-slate-400 font-mono"> / {selectedCarpark.lots.car.total}</span>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-1.5">
                <span className="block text-[10px] text-slate-400 uppercase">Bikes</span>
                <span className="font-mono text-sm font-bold text-sky-400">
                  {selectedCarpark.lots.motorcycle.available}
                </span>
                <span className="text-[10px] text-slate-400 font-mono"> / {selectedCarpark.lots.motorcycle.total}</span>
              </div>
              <div className="bg-slate-800/60 rounded-lg p-1.5">
                <span className="block text-[10px] text-slate-400 uppercase">Rate</span>
                <span className="font-mono text-xs font-semibold text-amber-300 truncate block">
                  {selectedCarpark.rates.weekdayPeak.split(' ')[0]}
                </span>
                <span className="text-[10px] text-slate-400">peak</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
