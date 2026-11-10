import React from 'react';
import { ShieldCheck, Info, Car, Bike, Truck, Moon, Sun, Clock } from 'lucide-react';

export const RateGuideSection: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          Singapore Carpark Rates & Rules Guide
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Standardized pricing conventions across Housing & Development Board (HDB), Urban Redevelopment Authority (URA), and commercial facilities.
        </p>
      </div>

      {/* Grid of Rate Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Car Rates */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Car className="w-4 h-4 text-emerald-400" />
            <span>Motorcars (HDB / URA)</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="font-semibold text-slate-300 block">Outside Central Area</span>
              <span className="font-mono text-emerald-400 font-bold text-sm">$0.60</span>
              <span className="text-slate-400 text-[11px]"> per 30 minutes</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="font-semibold text-slate-300 block">Within Central Area</span>
              <span className="font-mono text-amber-400 font-bold text-sm">$1.20</span>
              <span className="text-slate-400 text-[11px]"> per 30 mins (7:00am - 5:00pm)</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">$0.60 / 30 mins thereafter</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="font-semibold text-slate-300 block">Night Parking Cap</span>
              <span className="font-mono text-sky-400 font-bold text-sm">$5.00 Maximum</span>
              <span className="text-slate-400 text-[11px]"> (10:30pm to 7:00am next day)</span>
            </div>
          </div>
        </div>

        {/* Motorcycle & Heavy Vehicles */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Bike className="w-4 h-4 text-sky-400" />
            <span>Motorcycles & Heavy Vehicles</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="font-semibold text-slate-300 block">Motorcycles (Per Session)</span>
              <span className="font-mono text-sky-400 font-bold text-sm">$0.65</span>
              <span className="text-slate-400 text-[11px]"> Day session (7am - 10:30pm)</span>
              <span className="block font-mono text-sky-400 font-bold text-sm mt-1">$0.65</span>
              <span className="text-slate-400 text-[11px]"> Night session (10:30pm - 7am)</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                <Truck className="w-3.5 h-3.5 text-amber-400" />
                Heavy Vehicles
              </span>
              <span className="font-mono text-amber-400 font-bold text-sm">$1.20</span>
              <span className="text-slate-400 text-[11px]"> per 30 minutes</span>
              <span className="block text-[10px] text-slate-500 mt-0.5">Subject to designated heavy lots</span>
            </div>
          </div>
        </div>

        {/* Schemes & Grace Periods */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Clock className="w-4 h-4 text-purple-400" />
            <span>Schemes & Grace Periods</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="font-semibold text-emerald-300 block">Free Sunday Parking (FSP)</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Eligible HDB carparks offer free parking on Sundays and Public Holidays from 7:00 AM to 10:30 PM for short-term visitors.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="font-semibold text-slate-300 block">Grace Periods (Drop-off / Pick-up)</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Most EPS carparks provide a <strong className="text-slate-200">10 to 15-minute grace period</strong>. Exiting within the grace period is strictly free.
              </p>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80">
              <span className="font-semibold text-amber-300 block">Red-and-White Lot Rules</span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bi-coloured lots: Non-season parking holders may only park between 7:00 AM and 7:00 PM on Mondays to Saturdays. Strictly season holders at night.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
