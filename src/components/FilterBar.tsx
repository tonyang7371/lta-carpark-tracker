import React from 'react';
import { FilterState, VehicleType, CarparkAgency, SingaporeRegion } from '../types/carpark';
import { Search, X, Filter, Car, Bike, Truck, Zap, ShieldCheck } from 'lucide-react';

interface FilterBarProps {
  filters: FilterState;
  onFilterChange: (newFilters: FilterState) => void;
  totalCount: number;
  filteredCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  totalCount,
  filteredCount,
}) => {
  const agencies: ('All' | CarparkAgency)[] = ['All', 'HDB', 'Commercial', 'URA', 'LTA'];

  const vehicleOptions: { type: VehicleType; label: string; icon: React.ReactNode }[] = [
    { type: 'car', label: 'Cars', icon: <Car className="w-3.5 h-3.5" /> },
    { type: 'motorcycle', label: 'Motorcycles', icon: <Bike className="w-3.5 h-3.5" /> },
    { type: 'heavy', label: 'Heavy Vehicles', icon: <Truck className="w-3.5 h-3.5" /> },
  ];

  const handleSearchChange = (val: string) => {
    onFilterChange({ ...filters, searchQuery: val });
  };

  const handleClear = () => {
    onFilterChange({
      ...filters,
      searchQuery: '',
      agency: 'All',
      region: 'All',
      onlyWithEV: false,
      onlySheltered: false,
      minAvailableLots: 0,
      sortBy: 'available_desc',
    });
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.agency !== 'All' ||
    filters.region !== 'All' ||
    filters.onlyWithEV ||
    filters.onlySheltered ||
    filters.minAvailableLots > 0;

  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-3.5 shadow-sm">
      {/* Row 1: Search & Vehicle Type Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by carpark name, code (e.g. ACB), street, or MRT station..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-9 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => handleSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Vehicle Type Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 shrink-0">
          {vehicleOptions.map((v) => (
            <button
              key={v.type}
              type="button"
              onClick={() => onFilterChange({ ...filters, vehicleType: v.type })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filters.vehicleType === v.type
                  ? 'bg-slate-800 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {v.icon}
              <span>{v.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Row 2: Agency Filter, Feature Toggles & Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
        {/* Agency Selector */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs py-0.5">
          <span className="text-slate-500 mr-1 text-[11px] uppercase tracking-wider font-semibold">
            Agency:
          </span>
          {agencies.map((agency) => (
            <button
              key={agency}
              type="button"
              onClick={() => onFilterChange({ ...filters, agency })}
              className={`px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap ${
                filters.agency === agency
                  ? 'bg-slate-800 text-emerald-400 font-semibold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {agency}
            </button>
          ))}
        </div>

        {/* Quick Feature Toggles */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, onlyWithEV: !filters.onlyWithEV })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              filters.onlyWithEV
                ? 'bg-sky-950/60 border-sky-600/60 text-sky-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-3 h-3 text-sky-400" />
            EV Chargers
          </button>

          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, onlySheltered: !filters.onlySheltered })}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              filters.onlySheltered
                ? 'bg-slate-800 border-slate-600 text-slate-200'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3 h-3 text-slate-400" />
            Sheltered Only
          </button>

          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                minAvailableLots: filters.minAvailableLots === 0 ? 30 : 0,
              })
            }
            className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
              filters.minAvailableLots > 0
                ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Lots &gt; 30 Only
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
            Sort:
          </span>
          <select
            value={filters.sortBy}
            onChange={(e) => onFilterChange({ ...filters, sortBy: e.target.value as any })}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
          >
            <option value="available_desc">Most Lots Available</option>
            <option value="occupancy_asc">Lowest Occupancy %</option>
            <option value="capacity_desc">Largest Carpark Capacity</option>
            <option value="name_asc">Name (A-Z)</option>
          </select>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-rose-400 hover:text-rose-300 underline underline-offset-2 ml-1"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Results Counter Bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 pt-1 border-t border-slate-800/40">
        <span>
          Showing <span className="font-mono font-bold text-white">{filteredCount}</span> of{' '}
          <span className="font-mono">{totalCount}</span> carparks
        </span>

        {hasActiveFilters && (
          <span className="text-[11px] text-emerald-400">
            Active filters applied
          </span>
        )}
      </div>
    </div>
  );
};
