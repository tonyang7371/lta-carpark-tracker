import React, { useState } from 'react';
import { Carpark, VehicleType } from '../types/carpark';
import { calculateEstimatedFee } from '../services/carparkService';
import { 
  X, 
  Navigation, 
  Calculator, 
  Zap, 
  ShieldCheck, 
  Clock, 
  MapPin, 
  Building, 
  Car, 
  Bike, 
  Truck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface CarparkDetailModalProps {
  carpark: Carpark;
  isOpen: boolean;
  onClose: () => void;
  activeVehicleType: VehicleType;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  isOpen,
  onClose,
  activeVehicleType,
}) => {
  if (!isOpen) return null;

  // Rate calculator state
  const [stayDurationHours, setStayDurationHours] = useState<number>(2);
  const [stayDurationMins, setStayDurationMins] = useState<number>(30);
  const [entryTimeStr, setEntryTimeStr] = useState<string>('14:00');

  const totalStayMinutes = stayDurationHours * 60 + stayDurationMins;

  const simulatedDate = new Date();
  const [hh, mm] = entryTimeStr.split(':').map(Number);
  simulatedDate.setHours(hh || 12, mm || 0, 0, 0);

  const feeCalculation = calculateEstimatedFee(carpark, simulatedDate, totalStayMinutes);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-3xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 p-5 bg-slate-900/90">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="font-mono text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                {carpark.id}
              </span>
              <span className="text-xs font-semibold text-slate-400">
                {carpark.agency}
              </span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">
                {carpark.region}
              </span>
              {carpark.rates.isCentralArea && (
                <>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="text-xs text-amber-400 font-medium">
                    Central Area Surcharge Zone
                  </span>
                </>
              )}
            </div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              {carpark.name}
            </h2>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>{carpark.address}</span>
              <span aria-hidden="true">·</span>
              <span className="text-slate-300 font-medium">MRT: {carpark.nearestMrt}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* 1. Real-time Lots Breakdown by Vehicle Category */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Live Real-Time Lot Availabilities
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Cars */}
              <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                    <Car className="w-4 h-4 text-emerald-400" />
                    Cars
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {Math.round((carpark.lots.car.available / carpark.lots.car.total) * 100)}% free
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {carpark.lots.car.available}
                  </span>
                  <span className="text-xs font-mono text-slate-500">/ {carpark.lots.car.total}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500"
                    style={{ width: `${(carpark.lots.car.available / carpark.lots.car.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Motorcycles */}
              <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                    <Bike className="w-4 h-4 text-sky-400" />
                    Motorcycles
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {carpark.lots.motorcycle.total > 0
                      ? `${Math.round((carpark.lots.motorcycle.available / carpark.lots.motorcycle.total) * 100)}% free`
                      : 'N/A'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-sky-400 tabular-nums">
                    {carpark.lots.motorcycle.available}
                  </span>
                  <span className="text-xs font-mono text-slate-500">/ {carpark.lots.motorcycle.total}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-sky-500"
                    style={{
                      width: `${carpark.lots.motorcycle.total > 0 ? (carpark.lots.motorcycle.available / carpark.lots.motorcycle.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>

              {/* Heavy Vehicles */}
              <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
                    <Truck className="w-4 h-4 text-amber-400" />
                    Heavy Goods
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {carpark.lots.heavy.total > 0
                      ? `${Math.round((carpark.lots.heavy.available / carpark.lots.heavy.total) * 100)}% free`
                      : 'None'}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums">
                    {carpark.lots.heavy.available}
                  </span>
                  <span className="text-xs font-mono text-slate-500">/ {carpark.lots.heavy.total}</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div
                    className="h-full bg-amber-500"
                    style={{
                      width: `${carpark.lots.heavy.total > 0 ? (carpark.lots.heavy.available / carpark.lots.heavy.total) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 2. 24-Hour Occupancy Trend Prediction */}
          <div className="bg-slate-950/60 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <TrendingUp className="w-4 h-4 text-emerald-400" />
                Typical Daily Occupancy Pattern
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Historical peak: 12:00 - 14:00 & 18:00 - 20:00
              </span>
            </div>

            <div className="grid grid-cols-9 gap-1.5 items-end h-24 pt-4">
              {carpark.historyTrend.map((point) => {
                const isPeak = point.occupancyPct >= 85;
                const barColor = isPeak ? 'bg-rose-500' : point.occupancyPct >= 70 ? 'bg-amber-500' : 'bg-emerald-500';
                return (
                  <div key={point.hour} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                    <span className="text-[10px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {point.occupancyPct}%
                    </span>
                    <div
                      className={`w-full rounded-t ${barColor} transition-all duration-300 group-hover:brightness-125`}
                      style={{ height: `${point.occupancyPct}%` }}
                    />
                    <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">
                      {point.hour.split(':')[0]}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Interactive Parking Fee Estimator */}
          <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                <Calculator className="w-4 h-4 text-emerald-400" />
                Live Parking Fee Estimator
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Grace period: {carpark.rates.gracePeriodMins} mins
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Entry Time</label>
                <input
                  type="time"
                  value={entryTimeStr}
                  onChange={(e) => setEntryTimeStr(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Hours Duration</label>
                <input
                  type="number"
                  min="0"
                  max="48"
                  value={stayDurationHours}
                  onChange={(e) => setStayDurationHours(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Minutes Duration</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  step="15"
                  value={stayDurationMins}
                  onChange={(e) => setStayDurationMins(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-xs text-slate-300 space-y-1">
                {feeCalculation.breakdown.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4">
                <span className="text-[10px] text-slate-400 uppercase block">Estimated Total</span>
                <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                  ${feeCalculation.estimatedCost.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Rates & Carpark Features Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <h5 className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                Pricing Structure
              </h5>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Weekday Peak</span>
                  <span className="font-mono text-slate-200">{carpark.rates.weekdayPeak}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Weekday Off-Peak</span>
                  <span className="font-mono text-slate-200">{carpark.rates.weekdayOffPeak}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Saturday</span>
                  <span className="font-mono text-slate-200">{carpark.rates.saturday}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Sunday & Public Hol</span>
                  <span className="font-mono text-slate-200">{carpark.rates.sundayHoliday}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Night Parking Cap</span>
                  <span className="font-mono text-amber-300">{carpark.rates.nightCap}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h5 className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                Facility Specifications
              </h5>
              <div className="bg-slate-950/60 rounded-xl p-3 border border-slate-800 space-y-2">
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Gantry System</span>
                  <span className="font-mono text-slate-200">{carpark.parkingSystem}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Height Limit</span>
                  <span className="font-mono text-slate-200">{carpark.heightLimitMeters} metres</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/80">
                  <span className="text-slate-400">Covered / Sheltered</span>
                  <span className="text-slate-200">{carpark.isSheltered ? 'Yes (All Floors)' : 'Open Air / Surface'}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">EV Charging Hub</span>
                  <span className="font-mono text-sky-400">
                    {carpark.evChargers 
                      ? `${carpark.evChargers.provider} (${carpark.evChargers.available}/${carpark.evChargers.total} free, ${carpark.evChargers.powerKw}kW)`
                      : 'Not installed'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer / Direct Navigation CTAs */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 p-4 bg-slate-900/90">
          <div className="text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Last polled: {carpark.lastUpdated}</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={`https://waze.com/ul?ll=${carpark.coordinates.lat},${carpark.coordinates.lng}&navigate=yes`}
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium transition-colors"
            >
              Open in Waze
            </a>

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${carpark.coordinates.lat},${carpark.coordinates.lng}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1.5"
            >
              <Navigation className="w-3.5 h-3.5" />
              Navigate with Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
