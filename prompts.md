# Development Prompts Log

This document archives the prompt sequence used to design, build, and deploy the **ParkSG** Singapore Carpark Tracker application.

---

## Prompt 1: Initial Frontend Application Build

> build a singapore based carpark tracker application that tracks real time carpark lot availabilities. build just the front end for now. I will integrate the backend connection later.

### Implemented:
- Interactive vector map of Singapore with district filtering (Central / CBD, Orchard, East, West, North, North-East) and GPS projection.
- Real-time lot gauges and progress bars for Cars, Motorcycles, and Heavy Goods vehicles with tabular monospace figures.
- Dynamic parking rate calculator factoring in central area surcharges, grace periods, and night caps.
- 24-hour occupancy trend visualizers.
- Search, filter bar, and favorites bookmarking system.
- One-click navigation deep-links for Google Maps and Waze.
- Singapore parking rules and Free Sunday Parking (FSP) guide.

---

## Prompt 2: GitHub Repository Setup & Push

> git push https://<GITHUB_PERSONAL_ACCESS_TOKEN>@github.com/tonyang7371/lta-carpark-tracker.git

### Implemented:
- Initialized local Git repository and configured global user identity.
- Committed all application code under `main` branch.
- Added remote origin and pushed repository to GitHub: `https://github.com/tonyang7371/lta-carpark-tracker.git`.

---

## Prompt 3: LTA DataMall Serverless Connection

> 1. add a serverless connection that pulls live data from LTA's datamall using the following endpoints: 
> 
> # Live carpark lots (HDB + LTA + URA):
> https://datamall2.mytransport.sg/ltaodataservice/CarParkAvailabilityv2
> 
> # All requests need the header:  AccountKey: 
> 
> 2. store this in /api folder (at project root level)
> 3. include a /health.ts and /carparkavailability.ts
> 4. do not hardcode any keys, I will provide them later

### Implemented:
- Created `/api/health.ts`: serverless health check handler reporting uptime and LTA credential status.
- Created `/api/carparkavailability.ts`: serverless handler forwarding queries to LTA DataMall with `AccountKey` header, supporting pagination (`$skip`), full auto-pagination (`fetchAll=true`), 30s cache TTL, and raw/transformed formats.
- Created `server.ts` Express entry point mounting `/api/*` routes with Vite dev server.
- Updated `.env.example` with `LTA_DATAMALL_ACCOUNT_KEY` placeholder.
- Committed and pushed changes to GitHub `main`.

---

## Prompt 4: Prompts Compilation

> collate all the prompts into filename prompts.md

### Implemented:
- Collated and documented all conversation prompts, chronology, and corresponding implementation summaries into `prompts.md`.
