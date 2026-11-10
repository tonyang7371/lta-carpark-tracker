export type CarparkAgency = 'HDB' | 'URA' | 'LTA' | 'Commercial';
export type CarparkType = 'MSCP' | 'Basement' | 'Surface' | 'Mechanized';
export type VehicleType = 'car' | 'motorcycle' | 'heavy';
export type SingaporeRegion = 'Central / CBD' | 'Orchard & Tanglin' | 'East' | 'West' | 'North' | 'North-East';

export interface LotCapacity {
  available: number;
  total: number;
}

export interface EVChargerInfo {
  total: number;
  available: number;
  provider: string; // e.g., 'SP Group', 'Charge+', 'Shell Recharge', 'CDG ENGIE'
  powerKw: number;
}

export interface CarparkRates {
  weekdayPeak: string; // e.g. "$1.20 / 30 mins"
  weekdayOffPeak: string; // e.g. "$0.60 / 30 mins"
  saturday: string;
  sundayHoliday: string; // e.g. "Free 7am - 10:30pm" or "$0.60 / 30 mins"
  gracePeriodMins: number; // e.g. 15
  nightCap: string; // e.g. "Max $5.00 (10:30 PM - 7:00 AM)"
  isCentralArea: boolean;
}

export interface OccupancyTrendPoint {
  hour: string; // e.g., "08:00"
  occupancyPct: number; // 0 - 100
}

export interface Carpark {
  id: string; // e.g., 'ACB', 'BL22', 'ORC1'
  name: string;
  agency: CarparkAgency;
  carparkType: CarparkType;
  parkingSystem: 'Electronic (EPS)' | 'Coupon / Automated';
  address: string;
  district: string;
  region: SingaporeRegion;
  nearestMrt: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  lots: {
    car: LotCapacity;
    motorcycle: LotCapacity;
    heavy: LotCapacity;
  };
  rates: CarparkRates;
  evChargers: EVChargerInfo | null;
  heightLimitMeters: number;
  isSheltered: boolean;
  historyTrend: OccupancyTrendPoint[];
  lastUpdated: string;
}

export interface FilterState {
  searchQuery: string;
  agency: 'All' | CarparkAgency;
  vehicleType: VehicleType;
  region: 'All' | SingaporeRegion;
  onlyWithEV: boolean;
  onlySheltered: boolean;
  minAvailableLots: number;
  sortBy: 'available_desc' | 'occupancy_asc' | 'name_asc' | 'capacity_desc';
}

export interface BackendConfig {
  mode: 'built-in' | 'custom-api' | 'data-gov-sg';
  customApiUrl: string;
  apiKey?: string;
  autoRefreshIntervalSec: number;
  isLivePolling: boolean;
}
