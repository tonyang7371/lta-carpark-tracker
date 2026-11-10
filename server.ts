import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import healthHandler from './api/health.ts';
import carparkAvailabilityHandler from './api/carparkavailability.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Serverless API route mounts
app.get('/api/health', healthHandler);
app.get('/api/carparkavailability', carparkAvailabilityHandler);

// Alternative endpoint alias for convenience
app.get('/api/carpark-availability', carparkAvailabilityHandler);

async function startServer() {
  if (!isProd) {
    // Development mode: attach Vite middleware for instant HMR / SPA serving
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: serve built static assets from dist
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[ParkSG Server] Running on http://0.0.0.0:${port}`);
    console.log(`[ParkSG Server] API routes active:`);
    console.log(`  -> GET /api/health`);
    console.log(`  -> GET /api/carparkavailability`);
  });
}

startServer().catch((err) => {
  console.error('[ParkSG Server] Failed to start:', err);
  process.exit(1);
});
