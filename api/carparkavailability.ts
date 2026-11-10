import type { Request, Response } from 'express';

const LTA_DATAMALL_ENDPOINT = 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2';

export interface LTACarparkItem {
  CarParkID: string;
  Area: string;
  Development: string;
  Location: string; // "lat lng", e.g. "1.2935 103.8572"
  AvailableLots: number;
  LotType: 'C' | 'M' | 'H' | string; // C: Car, M: Motorcycle, H: Heavy Vehicle
  Agency: 'HDB' | 'URA' | 'LTA' | string;
}

export interface LTADatamallResponse {
  'odata.metadata'?: string;
  value: LTACarparkItem[];
}

// In-memory cache to respect LTA DataMall rate limits (default TTL: 30s)
interface CacheEntry {
  data: LTACarparkItem[];
  timestamp: number;
}
let cachedData: CacheEntry | null = null;
const CACHE_TTL_MS = 30 * 1000;

/**
 * Fetch a single page from LTA DataMall API
 */
async function fetchLTAPage(accountKey: string, skip = 0): Promise<LTACarparkItem[]> {
  const url = new URL(LTA_DATAMALL_ENDPOINT);
  if (skip > 0) {
    url.searchParams.set('$skip', skip.toString());
  }

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'AccountKey': accountKey,
      'accept': 'application/json',
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `LTA DataMall API responded with HTTP ${response.status} (${response.statusText}): ${errorBody || 'No error details provided'}`
    );
  }

  const json: LTADatamallResponse = await response.json();
  return json.value || [];
}

/**
 * Fetch all pages from LTA DataMall (up to 500 records per page)
 */
async function fetchAllLTACarparks(accountKey: string): Promise<LTACarparkItem[]> {
  const allCarparks: LTACarparkItem[] = [];
  let skip = 0;
  const pageSize = 500;
  let hasMore = true;
  let iterations = 0;
  const maxIterations = 10; // Safety cap (5000 records max)

  while (hasMore && iterations < maxIterations) {
    const page = await fetchLTAPage(accountKey, skip);
    allCarparks.push(...page);
    iterations++;

    if (page.length < pageSize) {
      hasMore = false;
    } else {
      skip += pageSize;
    }
  }

  return allCarparks;
}

/**
 * Transforms raw LTA flat carpark items into aggregated records grouped by CarParkID
 */
function transformLTAToAppSchema(rawItems: LTACarparkItem[]) {
  const grouped = new Map<string, any>();

  for (const item of rawItems) {
    const id = item.CarParkID;
    let entry = grouped.get(id);

    if (!entry) {
      let lat = 1.3521;
      let lng = 103.8198;
      if (item.Location && item.Location.trim()) {
        const parts = item.Location.trim().split(/\s+/).map(Number);
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          lat = parts[0];
          lng = parts[1];
        }
      }

      entry = {
        id: item.CarParkID,
        name: item.Development || `Carpark ${item.CarParkID}`,
        agency: item.Agency || 'LTA',
        carparkType: item.Agency === 'HDB' ? 'MSCP' : 'Surface',
        parkingSystem: 'Electronic (EPS)',
        address: `${item.Development || ''} (${item.Area || 'Singapore'})`.trim(),
        district: item.Area || 'Singapore',
        region: 'Central / CBD',
        nearestMrt: 'Nearby MRT',
        coordinates: { lat, lng },
        lots: {
          car: { available: 0, total: 200 },
          motorcycle: { available: 0, total: 50 },
          heavy: { available: 0, total: 10 },
        },
        rates: {
          weekdayPeak: item.Agency === 'HDB' ? '$0.60 / 30 mins' : '$1.20 / 30 mins',
          weekdayOffPeak: '$0.60 / 30 mins',
          saturday: '$0.60 / 30 mins',
          sundayHoliday: item.Agency === 'HDB' ? 'Free (7am - 10:30pm)' : '$0.60 / 30 mins',
          gracePeriodMins: 15,
          nightCap: 'Max $5.00 overnight',
          isCentralArea: item.Area?.toLowerCase().includes('marina') || item.Area?.toLowerCase().includes('orchard') || false,
        },
        evChargers: null,
        heightLimitMeters: 2.15,
        isSheltered: item.Agency === 'HDB',
        historyTrend: [
          { hour: '08:00', occupancyPct: 60 },
          { hour: '12:00', occupancyPct: 85 },
          { hour: '18:00', occupancyPct: 90 },
        ],
        lastUpdated: 'Live LTA DataMall',
      };
      grouped.set(id, entry);
    }

    // Accumulate lot types
    const lotsAvail = Number(item.AvailableLots) || 0;
    if (item.LotType === 'C') {
      entry.lots.car.available = lotsAvail;
      entry.lots.car.total = Math.max(entry.lots.car.total, lotsAvail + 50);
    } else if (item.LotType === 'M') {
      entry.lots.motorcycle.available = lotsAvail;
      entry.lots.motorcycle.total = Math.max(entry.lots.motorcycle.total, lotsAvail + 20);
    } else if (item.LotType === 'H') {
      entry.lots.heavy.available = lotsAvail;
      entry.lots.heavy.total = Math.max(entry.lots.heavy.total, lotsAvail + 5);
    }
  }

  return Array.from(grouped.values());
}

/**
 * Serverless / Express handler for LTA CarParkAvailabilityv2
 * Endpoint: /api/carparkavailability
 */
export default async function handler(req: Request, res: Response) {
  // CORS & Content-Type
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, AccountKey');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({
      error: 'METHOD_NOT_ALLOWED',
      message: 'Only GET requests are supported.',
    });
  }

  // 1. Resolve AccountKey from process.env or request headers
  const accountKey = (
    process.env.LTA_DATAMALL_ACCOUNT_KEY ||
    process.env.LTA_ACCOUNT_KEY ||
    process.env.ACCOUNT_KEY ||
    (req.headers['accountkey'] as string) ||
    ''
  ).trim();

  // 2. Validate key presence
  if (!accountKey) {
    return res.status(401).json({
      error: 'LTA_ACCOUNT_KEY_MISSING',
      message: 'AccountKey header is missing. Configure LTA_DATAMALL_ACCOUNT_KEY in your environment variables.',
      serviceEndpoint: LTA_DATAMALL_ENDPOINT,
      setupInstructions: [
        '1. Sign up for a free LTA DataMall account key at: https://datamall.lta.gov.sg/',
        '2. Add LTA_DATAMALL_ACCOUNT_KEY="<your_key>" to your environment configuration',
        '3. Restart or reload your serverless backend',
      ],
    });
  }

  // 3. Process query parameters
  const skipParam = parseInt(req.query.skip as string, 10);
  const skip = !isNaN(skipParam) && skipParam >= 0 ? skipParam : 0;
  const shouldFetchAll = req.query.fetchAll === 'true' || req.query.all === 'true';
  const format = (req.query.format as string) || 'raw'; // 'raw' | 'transformed'
  const forceFresh = req.query.fresh === 'true';

  try {
    let items: LTACarparkItem[] = [];

    // Check cache if fetching all records and not forced fresh
    const now = Date.now();
    if (shouldFetchAll && !forceFresh && cachedData && now - cachedData.timestamp < CACHE_TTL_MS) {
      items = cachedData.data;
    } else {
      if (shouldFetchAll) {
        items = await fetchAllLTACarparks(accountKey);
        cachedData = { data: items, timestamp: now };
      } else {
        items = await fetchLTAPage(accountKey, skip);
      }
    }

    if (format === 'transformed') {
      const transformed = transformLTAToAppSchema(items);
      return res.status(200).json({
        success: true,
        totalCarparks: transformed.length,
        timestamp: new Date().toISOString(),
        carparks: transformed,
      });
    }

    // Default 'raw' LTA OData payload format
    return res.status(200).json({
      'odata.metadata': 'http://datamall2.mytransport.sg/ltaodataservice/$metadata#CarParkAvailabilityv2',
      value: items,
      count: items.length,
      timestamp: new Date().toISOString(),
      cached: Boolean(shouldFetchAll && !forceFresh && cachedData && now - cachedData.timestamp < CACHE_TTL_MS),
    });
  } catch (error: any) {
    console.error('Error fetching from LTA DataMall CarParkAvailabilityv2:', error);
    return res.status(502).json({
      error: 'LTA_DATAMALL_FETCH_ERROR',
      message: error?.message || 'Failed to retrieve data from LTA DataMall.',
      endpoint: LTA_DATAMALL_ENDPOINT,
    });
  }
}
