import React from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import { 
  Navigation, 
  Calculator, 
  Star, 
  Zap, 
  ShieldCheck, 
  Clock, 
  Building2, 
  ArrowUpRight 
} from 'lucide-react';

interface CarparkCardProps {
  carpark: Carpark;
  activeVehicleType: VehicleType;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onOpenDetails: (carpark: Carpark) => void;
  onOpenCalculator: (carpark: Carpark) => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  activeVehicleType,
  isFavorite,
  onToggleFavorite,
  onOpenDetails,
  onOpenCalculator,
}) => {
  const lot = carpark.lots[activeVehicleType];
  const occupancyPct = lot.total > 0 ? Math.round(((lot.total - lot.available) / lot.total) * 100) : 0;
  const availablePct = 100 - occupancyPct;

  // Status computation
  let statusText = 'Plenty of Lots';
  let statusBadgeClass = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
  let barColorClass = 'bg-emerald-500';

  if (lot.available < 8 || availablePct < 8) {
    statusText = 'Critical / Almost Full';
    statusBadgeClass = 'text-rose-400 border-rose-500/30 bg-rose-500/10';
    barColorClass = 'bg-rose-500';
  } else if (lot.available < 30 || availablePct < 20) {
    statusText = 'Filling Fast';
    statusBadgeClass = 'text-amber-400 border-amber-500/30 bg-amber-500/10';
    barColorClass = 'bg-amber-500';
  }

  return (
    <div className="group relative rounded-xl border border-slate-800 bg-slate-900/80 p-4 transition-all duration-200 hover:border-slate-700 hover:bg-slate-900 shadow-sm flex flex-col justify-between">
      {/* Top Header Row */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-1.5">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/60">
                {carpark.id}
              </span>
              <span className="text-xs font-medium text-slate-400">
                {carpark.agency}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-xs text-slate-400 truncate">
                {carpark.district}
              </span>
            </div>

            <h3 
              onClick={() => onOpenDetails(carpark)}
              className="text-base font-semibold text-white group-hover:text-emerald-400 transition-colors cursor-pointer line-clamp-1"
            >
              {carpark.name}
            </h3>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(carpark.id);
            }}
            title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            className={`p-1.5 rounded-lg border transition-colors shrink-0 ${
              isFavorite
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <Star className={`w-4 h-4 ${isFavorite ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Clean Unboxed Metadata Separated by Subtle Dots (Zero-Pill Rule) */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-3.5">
          <span>{carpark.carparkType}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>MRT: {carpark.nearestMrt}</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Clearance {carpark.heightLimitMeters}m</span>
          {carpark.isSheltered && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="flex items-center gap-1 text-slate-300">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                Sheltered
              </span>
            </>
          )}
        </div>

        {/* Real-Time Lots Gauge Block */}
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800/80 mb-3">
          <div className="flex items-end justify-between mb-2">
            <div>
              <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">
                Available Lots ({activeVehicleType})
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-bold font-mono text-white tabular-nums tracking-tight">
                  {lot.available}
                </span>
                <span className="text-xs font-mono text-slate-500">
                  / {lot.total} total
                </span>
              </div>
            </div>

            <div className="text-right">
              <span className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border ${statusBadgeClass}`}>
                {statusText}
              </span>
              <div className="text-[11px] font-mono text-slate-400 mt-1">
                {occupancyPct}% occupied
              </div>
            </div>
          </div>

          {/* Capacity Progress Bar */}
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
            <div
              className={`h-full ${barColorClass} transition-all duration-500`}
              style={{ width: `${Math.max(2, availablePct)}%` }}
              title={`${availablePct}% available lots`}
            />
          </div>
        </div>

        {/* Rate & Features Snapshot */}
        <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-slate-800/80 text-slate-300 mb-3">
          <div>
            <span className="text-slate-500 block text-[11px]">Standard Peak Rate</span>
            <span className="font-mono font-medium text-slate-200 truncate block">
              {carpark.rates.weekdayPeak}
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[11px]">Grace Period</span>
            <span className="font-mono text-slate-300">
              {carpark.rates.gracePeriodMins} mins free
            </span>
          </div>
        </div>

        {/* EV Charging Info if present */}
        {carpark.evChargers && (
          <div className="flex items-center justify-between text-xs bg-sky-950/30 border border-sky-900/40 rounded-lg px-2.5 py-1.5 mb-3 text-sky-300">
            <span className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-sky-400" />
              <span>{carpark.evChargers.provider} ({carpark.evChargers.powerKw}kW)</span>
            </span>
            <span className="font-mono text-xs font-semibold text-sky-200">
              {carpark.evChargers.available} / {carpark.evChargers.total} plugs free
            </span>
          </div>
        )}
      </div>

      {/* Card Actions Bottom Row */}
      <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => onOpenDetails(carpark)}
          className="flex-1 py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-colors text-center"
        >
          Details & Trends
        </button>

        <button
          type="button"
          onClick={() => onOpenCalculator(carpark)}
          title="Calculate parking fee"
          className="p-1.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700/60"
        >
          <Calculator className="w-4 h-4" />
        </button>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`}
          target="_blank"
          rel="noreferrer"
          title="Open Directions in Google Maps"
          className="p-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 hover:text-emerald-200 transition-colors border border-emerald-500/30"
        >
          <Navigation className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
};
