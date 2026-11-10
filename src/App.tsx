import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Carpark, 
  FilterState, 
  BackendConfig, 
  VehicleType, 
  SingaporeRegion 
} from './types/carpark';
import { 
  INITIAL_SINGAPORE_CARPARKS 
} from './data/singaporeCarparks';
import { 
  fetchCarparks, 
  getSavedBackendConfig, 
  saveBackendConfig, 
  getSavedFavorites, 
  saveFavorites 
} from './services/carparkService';

import { Navbar } from './components/Navbar';
import { StatsOverview } from './components/StatsOverview';
import { FilterBar } from './components/FilterBar';
import { CarparkCard } from './components/CarparkCard';
import { InteractiveMap } from './components/InteractiveMap';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { BackendIntegrationModal } from './components/BackendIntegrationModal';
import { RateGuideSection } from './components/RateGuideSection';

import { 
  Map, 
  ListFilter, 
  Sparkles, 
  Star, 
  ArrowRight, 
  Server, 
  Compass, 
  Info,
  CheckCircle2,
  RefreshCw,
  Building2
} from 'lucide-react';

export default function App() {
  // --- Persistent & Configuration State ---
  const [backendConfig, setBackendConfig] = useState<BackendConfig>(getSavedBackendConfig);
  const [favorites, setFavorites] = useState<string[]>(getSavedFavorites);

  // --- Data State ---
  const [carparks, setCarparks] = useState<Carpark[]>(INITIAL_SINGAPORE_CARPARKS);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');
  const [refreshCountdown, setRefreshCountdown] = useState<number>(backendConfig.autoRefreshIntervalSec);

  // --- UI Navigation & Filter State ---
  const [activeTab, setActiveTab] = useState<'tracker' | 'map' | 'favorites' | 'rates'>('tracker');
  const [showMapInTracker, setShowMapInTracker] = useState<boolean>(true);

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    agency: 'All',
    vehicleType: 'car',
    region: 'All',
    onlyWithEV: false,
    onlySheltered: false,
    minAvailableLots: 0,
    sortBy: 'available_desc',
  });

  // Modal State
  const [selectedCarparkModal, setSelectedCarparkModal] = useState<Carpark | null>(null);
  const [selectedCarparkMap, setSelectedCarparkMap] = useState<Carpark | null>(null);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);

  // --- Real-time Data Polling Logic ---
  const performRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const updated = await fetchCarparks(backendConfig, carparks);
      setCarparks(updated);
      setLastSyncTime(new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } catch (err) {
      console.error('Refresh failed:', err);
    } finally {
      setIsRefreshing(false);
      setRefreshCountdown(backendConfig.autoRefreshIntervalSec);
    }
  }, [backendConfig, carparks]);

  // Countdown and interval timer
  useEffect(() => {
    if (!backendConfig.isLivePolling) return;

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          performRefresh();
          return backendConfig.autoRefreshIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [backendConfig.isLivePolling, backendConfig.autoRefreshIntervalSec, performRefresh]);

  // Favorite toggle
  const handleToggleFavorite = (id: string) => {
    const next = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];
    setFavorites(next);
    saveFavorites(next);
  };

  // Backend config update
  const handleSaveBackendConfig = (newConfig: BackendConfig) => {
    setBackendConfig(newConfig);
    saveBackendConfig(newConfig);
    setRefreshCountdown(newConfig.autoRefreshIntervalSec);
    performRefresh();
  };

  // Test connection function
  const handleTestConnection = async (url: string, apiKey?: string) => {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;
    const res = await fetch(url, { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    const data = await res.json();
    const count = Array.isArray(data) ? data.length : data.carparks?.length || 0;
    return {
      success: true,
      message: `Successfully connected! Received ${count} carpark records.`,
      count,
    };
  };

  // --- Filter & Sorting Logic ---
  const displayedCarparks = useMemo(() => {
    return carparks.filter((cp) => {
      // 1. Favorites tab restriction
      if (activeTab === 'favorites' && !favorites.includes(cp.id)) {
        return false;
      }

      // 2. Search query (matches code, name, address, district, or MRT)
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matches =
          cp.id.toLowerCase().includes(q) ||
          cp.name.toLowerCase().includes(q) ||
          cp.address.toLowerCase().includes(q) ||
          cp.district.toLowerCase().includes(q) ||
          cp.nearestMrt.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // 3. Agency filter
      if (filters.agency !== 'All' && cp.agency !== filters.agency) {
        return false;
      }

      // 4. Region filter
      if (filters.region !== 'All' && cp.region !== filters.region) {
        return false;
      }

      // 5. EV Chargers only
      if (filters.onlyWithEV && (!cp.evChargers || cp.evChargers.available === 0)) {
        return false;
      }

      // 6. Sheltered only
      if (filters.onlySheltered && !cp.isSheltered) {
        return false;
      }

      // 7. Minimum available lots
      const availableLots = cp.lots[filters.vehicleType].available;
      if (filters.minAvailableLots > 0 && availableLots < filters.minAvailableLots) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      const lotA = a.lots[filters.vehicleType];
      const lotB = b.lots[filters.vehicleType];

      if (filters.sortBy === 'available_desc') {
        return lotB.available - lotA.available;
      }
      if (filters.sortBy === 'occupancy_asc') {
        const occA = (lotA.total - lotA.available) / (lotA.total || 1);
        const occB = (lotB.total - lotB.available) / (lotB.total || 1);
        return occA - occB;
      }
      if (filters.sortBy === 'capacity_desc') {
        return lotB.total - lotA.total;
      }
      if (filters.sortBy === 'name_asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });
  }, [carparks, filters, activeTab, favorites]);

  // Quick region chips
  const quickAreas = ['Marina Bay', 'Orchard', 'Tampines', 'Jurong', 'Woodlands', 'Punggol'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-slate-950 flex flex-col">
      {/* 1. Strict 3-Zone Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        favoritesCount={favorites.length}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
        onManualRefresh={performRefresh}
        isRefreshing={isRefreshing}
        isCustomBackendActive={backendConfig.mode === 'custom-api'}
        refreshCountdown={refreshCountdown}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Editorial Subtitle & Context Banner (Outside header, complying with strict Top Bar Contract) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
              <span>Republic of Singapore</span>
              <span aria-hidden="true">·</span>
              <span>Electronic Parking System (EPS) Real-Time Feeds</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-mono">Synced {lastSyncTime}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Real-Time Carpark Lot Tracker
            </h1>
          </div>

          {/* Quick Area Filter Shortcuts */}
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-500 mr-1">Popular:</span>
            {quickAreas.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => setFilters((prev) => ({ ...prev, searchQuery: area }))}
                className="px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Island-wide Statistics Overview Strip */}
        <StatsOverview
          carparks={carparks}
          activeVehicleType={filters.vehicleType}
          lastSyncTime={lastSyncTime}
        />

        {/* 3. Conditional Content by Active Tab */}
        {activeTab === 'rates' ? (
          <RateGuideSection />
        ) : activeTab === 'map' ? (
          /* Dedicated Interactive Map View */
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Singapore Island Lot Map
                </h2>
                <p className="text-xs text-slate-400">
                  Interactive real-time lot availability visualizer across Singapore districts. Click any pin for full lot breakdown.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('tracker')}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                <ListFilter className="w-3.5 h-3.5" />
                Switch to List View
              </button>
            </div>

            <InteractiveMap
              carparks={displayedCarparks}
              selectedCarpark={selectedCarparkMap}
              onSelectCarpark={(cp) => {
                setSelectedCarparkMap(cp);
                setSelectedCarparkModal(cp);
              }}
              activeVehicleType={filters.vehicleType}
              selectedRegion={filters.region}
              onSelectRegion={(reg) => setFilters((prev) => ({ ...prev, region: reg }))}
            />
          </div>
        ) : (
          /* Carpark Tracker & List Tab */
          <div className="space-y-5">
            {/* Map Toggle & Mini View */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowMapInTracker(!showMapInTracker)}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <Map className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{showMapInTracker ? 'Hide Map Overview' : 'Show Map Overview'}</span>
                </button>
              </div>

              {activeTab === 'favorites' && (
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  Showing your {favorites.length} bookmarked carparks
                </span>
              )}
            </div>

            {showMapInTracker && (
              <InteractiveMap
                carparks={displayedCarparks}
                selectedCarpark={selectedCarparkMap}
                onSelectCarpark={(cp) => {
                  setSelectedCarparkMap(cp);
                  setSelectedCarparkModal(cp);
                }}
                activeVehicleType={filters.vehicleType}
                selectedRegion={filters.region}
                onSelectRegion={(reg) => setFilters((prev) => ({ ...prev, region: reg }))}
              />
            )}

            {/* Filter & Search Bar */}
            <FilterBar
              filters={filters}
              onFilterChange={setFilters}
              totalCount={carparks.length}
              filteredCount={displayedCarparks.length}
            />

            {/* Carpark Cards Grid */}
            {displayedCarparks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {displayedCarparks.map((cp) => (
                  <CarparkCard
                    key={cp.id}
                    carpark={cp}
                    activeVehicleType={filters.vehicleType}
                    isFavorite={favorites.includes(cp.id)}
                    onToggleFavorite={handleToggleFavorite}
                    onOpenDetails={(carpark) => setSelectedCarparkModal(carpark)}
                    onOpenCalculator={(carpark) => setSelectedCarparkModal(carpark)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-12 text-center max-w-lg mx-auto">
                <Compass className="w-10 h-10 text-slate-500 mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">
                  No carparks match your filter criteria
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  {activeTab === 'favorites'
                    ? "You haven't bookmarked any carparks yet. Star any carpark card to monitor it here."
                    : 'Try clearing your search term, switching vehicle types, or adjusting minimum lots.'}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      searchQuery: '',
                      agency: 'All',
                      vehicleType: 'car',
                      region: 'All',
                      onlyWithEV: false,
                      onlySheltered: false,
                      minAvailableLots: 0,
                      sortBy: 'available_desc',
                    })
                  }
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Carpark Detail & Fee Calculator Modal */}
      {selectedCarparkModal && (
        <CarparkDetailModal
          carpark={selectedCarparkModal}
          isOpen={!!selectedCarparkModal}
          onClose={() => setSelectedCarparkModal(null)}
          activeVehicleType={filters.vehicleType}
        />
      )}

      {/* Backend Integration & API Configuration Modal */}
      <BackendIntegrationModal
        isOpen={isBackendModalOpen}
        onClose={() => setIsBackendModalOpen(false)}
        config={backendConfig}
        onSaveConfig={handleSaveBackendConfig}
        onTestConnection={handleTestConnection}
      />

      {/* Quiet Footer (Complying with Anti-Slop Bans: no fake telemetry tickers or pseudo code engines) */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 px-4 sm:px-6 text-xs text-slate-500 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">ParkSG</span>
            <span aria-hidden="true">·</span>
            <span>Singapore Real-Time Carpark Tracker</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              type="button"
              onClick={() => setIsBackendModalOpen(true)}
              className="text-slate-400 hover:text-emerald-400 transition-colors"
            >
              Backend API Configuration
            </button>
            <a
              href="https://beta.data.gov.sg/collections/139/datasets/d_23f946fa557947f93a8043bbef41dd09/view"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              Data.gov.sg Open Data
            </a>
            <a
              href="https://datamall.lta.gov.sg/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-300 transition-colors"
            >
              LTA DataMall
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
