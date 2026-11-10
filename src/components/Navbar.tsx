import React from 'react';
import { RefreshCw, Server, Star, Map, ListFilter, Sparkles } from 'lucide-react';

interface NavbarProps {
  activeTab: 'tracker' | 'map' | 'favorites' | 'rates';
  onSelectTab: (tab: 'tracker' | 'map' | 'favorites' | 'rates') => void;
  favoritesCount: number;
  onOpenBackendModal: () => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  isCustomBackendActive: boolean;
  refreshCountdown: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  favoritesCount,
  onOpenBackendModal,
  onManualRefresh,
  isRefreshing,
  isCustomBackendActive,
  refreshCountdown,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 h-16">
        {/* Zone 1: Brand wordmark (single text element wordmark, display face) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onSelectTab('tracker');
            }}
            className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:text-emerald-400 transition-colors"
          >
            <span className="w-7 h-7 rounded-lg bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm">
              P
            </span>
            <span>ParkSG</span>
          </a>

          {isCustomBackendActive && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 whitespace-nowrap">
              Connected API
            </span>
          )}
        </div>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
          <button
            type="button"
            onClick={() => onSelectTab('tracker')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'tracker'
                ? 'text-white font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            All Carparks
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('map')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'map'
                ? 'text-white font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Interactive Map
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('favorites')}
            className={`whitespace-nowrap shrink-0 transition-colors flex items-center gap-1.5 ${
              activeTab === 'favorites'
                ? 'text-white font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            <span>Favorites</span>
            {favoritesCount > 0 && (
              <span className="font-mono text-[11px] bg-slate-800 text-slate-300 px-1.5 rounded">
                {favoritesCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onSelectTab('rates')}
            className={`whitespace-nowrap shrink-0 transition-colors ${
              activeTab === 'rates'
                ? 'text-white font-semibold'
                : 'hover:text-slate-200'
            }`}
          >
            Parking Rates & ERP
          </button>

          <button
            type="button"
            onClick={onOpenBackendModal}
            className="whitespace-nowrap shrink-0 text-slate-400 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
          >
            <Server className="w-3.5 h-3.5 text-slate-500" />
            <span>Connect Backend</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Refresh Lots</span>
            <span className="font-mono text-[10px] text-slate-800 ml-0.5">
              ({refreshCountdown}s)
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
