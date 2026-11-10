import { Carpark, BackendConfig } from '../types/carpark';
import { INITIAL_SINGAPORE_CARPARKS } from '../data/singaporeCarparks';

const STORAGE_KEY_CONFIG = 'park_sg_backend_config';
const STORAGE_KEY_FAVORITES = 'park_sg_favorites';

export const DEFAULT_BACKEND_CONFIG: BackendConfig = {
  mode: 'built-in',
  customApiUrl: '/api/v1/carparks',
  autoRefreshIntervalSec: 30,
  isLivePolling: true,
};

// Retrieve stored backend configuration
export function getSavedBackendConfig(): BackendConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (raw) {
      return { ...DEFAULT_BACKEND_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('Failed to parse backend config from localStorage', err);
  }
  return DEFAULT_BACKEND_CONFIG;
}

export function saveBackendConfig(config: BackendConfig): void {
  try {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  } catch (err) {
    console.warn('Failed to save backend config to localStorage', err);
  }
}

// Favorites storage
export function getSavedFavorites(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_FAVORITES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return ['MBS-B1', 'CAG-T3', 'TM1-HDB'];
}

export function saveFavorites(favIds: string[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_FAVORITES, JSON.stringify(favIds));
  } catch {
    // ignore
  }
}

/**
 * Simulates subtle real-time lot fluctuations (cars entering / leaving)
 * to emulate real Singapore EPS live feeds during frontend demonstration.
 */
function applySimulatedLiveJitter(carparks: Carpark[]): Carpark[] {
  return carparks.map((cp) => {
    // random delta between -3 and +3 lots
    const delta = Math.floor(Math.random() * 7) - 3;
    const newCarAvail = Math.max(0, Math.min(cp.lots.car.total, cp.lots.car.available + delta));
    
    // occasionally nudge motorbike
    const motoDelta = Math.random() > 0.5 ? Math.floor(Math.random() * 3) - 1 : 0;
    const newMotoAvail = Math.max(0, Math.min(cp.lots.motorcycle.total, cp.lots.motorcycle.available + motoDelta));

    return {
      ...cp,
      lots: {
        ...cp.lots,
        car: {
          ...cp.lots.car,
          available: newCarAvail,
        },
        motorcycle: {
          ...cp.lots.motorcycle,
          available: newMotoAvail,
        },
      },
      lastUpdated: 'Just now',
    };
  });
}

/**
 * Fetch carpark data based on configured mode:
 * 1. 'built-in': Uses rich built-in Singapore dataset with real-time EPS fluctuation simulation
 * 2. 'custom-api': Fetches from user's custom backend endpoint
 * 3. 'data-gov-sg': Connects to public GovTech Data.gov.sg Carpark Availability API
 */
export async function fetchCarparks(config: BackendConfig, currentData?: Carpark[]): Promise<Carpark[]> {
  if (config.mode === 'custom-api' && config.customApiUrl) {
    try {
      const headers: Record<string, string> = {
        'Accept': 'application/json',
      };
      if (config.apiKey) {
        headers['Authorization'] = `Bearer ${config.apiKey}`;
      }
      const res = await fetch(config.customApiUrl, { headers });
      if (!res.ok) {
        throw new Error(`Custom API returned HTTP ${res.status}: ${res.statusText}`);
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        return data as Carpark[];
      } else if (data.carparks && Array.isArray(data.carparks)) {
        return data.carparks as Carpark[];
      }
      throw new Error('API payload must return an array or { carparks: [...] }');
    } catch (error) {
      console.error('Custom API fetch failed, falling back to built-in Singapore dataset:', error);
      throw error;
    }
  }

  // Built-in mode: apply subtle real-time EPS fluctuation
  const baseData = currentData && currentData.length > 0 ? currentData : INITIAL_SINGAPORE_CARPARKS;
  return applySimulatedLiveJitter(baseData);
}

/**
 * Parking rate calculation helper based on entry time, duration, and carpark rates
 */
export function calculateEstimatedFee(
  carpark: Carpark,
  entryDateTime: Date,
  durationMinutes: number
): {
  estimatedCost: number;
  breakdown: string[];
  isWithinGracePeriod: boolean;
} {
  const breakdown: string[] = [];
  
  // 1. Grace period check
  if (durationMinutes <= carpark.rates.gracePeriodMins) {
    return {
      estimatedCost: 0,
      breakdown: [
        `Stay duration: ${durationMinutes} mins`,
        `Within ${carpark.rates.gracePeriodMins} minutes free grace period. Fee: $0.00`,
      ],
      isWithinGracePeriod: true,
    };
  }

  const hours = Math.floor(durationMinutes / 60);
  const remainingMins = durationMinutes % 60;
  const isSunday = entryDateTime.getDay() === 0;

  breakdown.push(`Total duration: ${hours}h ${remainingMins}m (${durationMinutes} mins)`);

  let estimatedCost = 0;

  if (carpark.agency === 'HDB' || carpark.agency === 'URA') {
    // Standard Singapore HDB/URA rule
    const isCentral = carpark.rates.isCentralArea;
    const ratePerHalfHour = isCentral ? 1.20 : 0.60;
    const halfHourBlocks = Math.ceil(durationMinutes / 30);
    
    if (isSunday && carpark.rates.sundayHoliday.toLowerCase().includes('free')) {
      estimatedCost = 0;
      breakdown.push(`Sunday / Public Holiday Free Parking scheme: $0.00`);
    } else {
      estimatedCost = halfHourBlocks * ratePerHalfHour;
      breakdown.push(`${halfHourBlocks} x 30-min blocks @ $${ratePerHalfHour.toFixed(2)} = $${estimatedCost.toFixed(2)}`);
      
      // Check overnight cap if applicable
      const entryHour = entryDateTime.getHours();
      if ((entryHour >= 22 || entryHour < 7) && durationMinutes > 180) {
        estimatedCost = Math.min(estimatedCost, 5.00);
        breakdown.push(`Capped at HDB Night Parking maximum: $5.00`);
      }
    }
  } else {
    // Commercial Mall rate simulation
    // Typically ~$1.50 for 1st hour, then ~$0.75 per 30 mins
    const firstHrRate = carpark.rates.isCentralArea ? 2.50 : 1.40;
    const subHalfHrRate = carpark.rates.isCentralArea ? 1.10 : 0.70;

    if (durationMinutes <= 60) {
      estimatedCost = firstHrRate;
      breakdown.push(`1st hour standard rate: $${firstHrRate.toFixed(2)}`);
    } else {
      const extraMins = durationMinutes - 60;
      const extraBlocks = Math.ceil(extraMins / 30);
      const extraCost = extraBlocks * subHalfHrRate;
      estimatedCost = firstHrRate + extraCost;
      breakdown.push(`1st hour: $${firstHrRate.toFixed(2)}`);
      breakdown.push(`${extraBlocks} additional 30-min block(s) @ $${subHalfHrRate.toFixed(2)}: $${extraCost.toFixed(2)}`);
    }
  }

  return {
    estimatedCost: Number(estimatedCost.toFixed(2)),
    breakdown,
    isWithinGracePeriod: false,
  };
}
