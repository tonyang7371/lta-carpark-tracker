import type { Request, Response } from 'express';

export interface HealthCheckResponse {
  status: 'ok' | 'degraded';
  timestamp: string;
  uptime: number;
  environment: string;
  ltaConnection: {
    accountKeyConfigured: boolean;
    serviceEndpoint: string;
  };
}

/**
 * Serverless / Express health handler
 * Endpoint: /api/health
 */
export default async function handler(req: Request, res: Response) {
  const ltaKey = process.env.LTA_DATAMALL_ACCOUNT_KEY || process.env.LTA_ACCOUNT_KEY || process.env.ACCOUNT_KEY;
  const isKeyConfigured = Boolean(ltaKey && ltaKey.trim().length > 0);

  const payload: HealthCheckResponse = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    ltaConnection: {
      accountKeyConfigured: isKeyConfigured,
      serviceEndpoint: 'https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2',
    },
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store, max-age=0');
  return res.status(200).json(payload);
}
