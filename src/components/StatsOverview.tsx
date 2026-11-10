import React from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import { Car, Bike, Zap, Building2, MapPin, Gauge } from 'lucide-react';

interface StatsOverviewProps {
  carparks: Carpark[];
  activeVehicleType: VehicleType;
  lastSyncTime: string;
}

export const StatsOverview: React.FC<StatsOverviewProps> = ({
  carparks,
  activeVehicleType,
  lastSyncTime,
}) => {
  // Aggregate stats
  const totalCarparks = carparks.length;
  
  const totalLots = carparks.reduce((acc, cp) => acc + cp.lots[activeVehicleType].total, 0);
  const totalAvailable = carparks.reduce((acc, cp) => acc + cp.lots[activeVehicleType].available, 0);
  const totalOccupied = totalLots - totalAvailable;
  const islandOccupancyPct = totalLots > 0 ? Math.round((totalOccupied / totalLots) * 100) : 0;

  const totalEvAvailable = carparks.reduce((acc, cp) => acc + (cp.evChargers?.available || 0), 0);
  const totalEvChargers = carparks.reduce((acc, cp) => acc + (cp.evChargers?.total || 0), 0);

  // Region with highest available lots
  const regionAvailability: Record<string, { avail: number; total: number }> = {};
  carparks.forEach((cp) => {
    if (!regionAvailability[cp.region]) {
      regionAvailability[cp.region] = { avail: 0, total: 0 };
    }
    regionAvailability[cp.region].avail += cp.lots[activeVehicleType].available;
    regionAvailability[cp.region].total += cp.lots[activeVehicleType].total;
  });

  let topRegion = 'Central / CBD';
  let topLots = 0;
  Object.entries(regionAvailability).forEach(([reg, data]) => {
    if (data.avail > topLots) {
      topLots = data.avail;
      topRegion = reg;
    }
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {/* Metric 1: Total Available Lots */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium text-slate-400">Available Lots ({activeVehicleType})</span>
          <Car className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
            {totalAvailable.toLocaleString()}
          </span>
          <span className="text-xs font-mono text-slate-500">
            / {totalLots.toLocaleString()}
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {100 - islandOccupancyPct}% island-wide capacity free
        </div>
      </div>

      {/* Metric 2: Occupancy Rate */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium text-slate-400">Island Occupancy</span>
          <Gauge className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-white tabular-nums">
            {islandOccupancyPct}%
          </span>
          <span className="text-xs font-mono text-slate-500">
            occupied
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1">
          {totalOccupied.toLocaleString()} vehicles parked
        </div>
      </div>

      {/* Metric 3: EV Fast Charging Points */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium text-slate-400">EV Chargers Free</span>
          <Zap className="w-4 h-4 text-sky-400" />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
            {totalEvAvailable}
          </span>
          <span className="text-xs font-mono text-slate-500">
            / {totalEvChargers} plugs
          </span>
        </div>
        <div className="text-[11px] text-slate-400 mt-1 truncate">
          SP Group, Charge+, Shell
        </div>
      </div>

      {/* Metric 4: Top Availability Hub */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-3.5 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-xs font-medium text-slate-400">Top Available Hub</span>
          <MapPin className="w-4 h-4 text-amber-400" />
        </div>
        <div className="truncate">
          <span className="text-base font-bold text-white block truncate">
            {topRegion}
          </span>
        </div>
        <div className="text-[11px] font-mono text-emerald-400 mt-1">
          {topLots.toLocaleString()} vacant lots
        </div>
      </div>
    </div>
  );
};
