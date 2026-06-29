# DriveLens Architecture

## Overview

DriveLens is a **provider-agnostic EV analytics platform** deployed entirely on Vercel. Tesla is the first `VehicleProvider` implementation; the application never calls Tesla APIs directly from client components.

```text
                   Tesla Fleet API
                          │
                    OAuth (Auth.js)
                          │
               Next.js Route Handlers
                          │
         ┌────────────────┼────────────────┐
         │                │                │
    MongoDB Atlas   Upstash QStash   Gemini API
         │                │                │
         └────────────────┼────────────────┘
                          │
                 Next.js App Router
                          │
                     React Dashboard
```

## Core principles

1. **No separate backend** — API routes and Server Actions only; no Express/Spring.
2. **Provider abstraction** — `VehicleProvider` interface; Tesla first.
3. **Snapshot-based sync** — Poll every 5 min; never hammer live APIs on page load.
4. **Pre-aggregated analytics** — Cron jobs compute daily/weekly/monthly rollups.
5. **Server-first data** — Sensitive tokens and API keys never reach the client.

## Vehicle provider abstraction

```typescript
interface VehicleProvider {
  id: string;
  listVehicles(accessToken): Promise<Vehicle[]>;
  getVehicleSnapshot(accessToken, vehicleId): Promise<VehicleSnapshot>;
  sendNavigation(accessToken, vehicleId, lat, lng): Promise<void>;
}
```

Implementations:

| Provider | Status | Path |
| -------- | ------ | ---- |
| Tesla | Phase 2 | `lib/providers/vehicle/tesla/` |
| Rivian | Future | — |
| Polestar | Future | — |

Registry: `lib/providers/vehicle/registry.ts`

## API surface

| Route | Purpose | Phase |
| ----- | ------- | ----- |
| `/api/auth/*` | Auth.js handlers | 1 |
| `/api/vehicle` | Live + cached vehicle status | 2 |
| `/api/trips` | Trip list and detail | 3 |
| `/api/charging` | Charging sessions | 3 |
| `/api/favorites` | CRUD favorites | 4 |
| `/api/navigation` | Send destination to vehicle | 4 |
| `/api/analytics` | Aggregated metrics | 3 |
| `/api/reports` | PDF generation | 5 |
| `/api/cron/sync-vehicle` | 5-min snapshot sync | 2 |
| `/api/cron/sync-charging` | Charging session detection | 3 |
| `/api/cron/aggregate-analytics` | Rollup jobs | 3 |
| `/api/cron/ai-insights` | Gemini batch insights | 4 |
| `/api/cron/cleanup` | TTL old logs | 5 |

## MongoDB collections

### `users`

```json
{
  "_id": "ObjectId",
  "email": "string",
  "name": "string",
  "image": "string?",
  "teslaAccount": {
    "accessToken": "encrypted",
    "refreshToken": "encrypted",
    "expiresAt": "Date",
    "vehicleIds": ["string"]
  },
  "preferences": {
    "units": "metric | imperial",
    "notifications": {}
  },
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

Indexes: `email` (unique)

### `vehicles`

```json
{
  "_id": "ObjectId",
  "userId": "ObjectId",
  "provider": "tesla",
  "externalId": "string",
  "displayName": "string",
  "vin": "string?",
  "model": "string?",
  "color": "string?"
}
```

Indexes: `userId`, `provider + externalId` (unique)

### `vehicleSnapshots`

Inserted on every sync (5 min). Never update — append only.

```json
{
  "vehicleId": "ObjectId",
  "timestamp": "Date",
  "batteryLevel": 81,
  "rangeKm": 445,
  "odometerKm": 28841,
  "locked": true,
  "chargingState": "Charging | Complete | Disconnected",
  "insideTempC": 23,
  "outsideTempC": 17,
  "latitude": 12.34,
  "longitude": 56.78,
  "heading": 180
}
```

Indexes: `vehicleId + timestamp` (compound, for time-series queries)

TTL: optional 2-year retention on `timestamp`

### `trips`

```json
{
  "vehicleId": "ObjectId",
  "startTime": "Date",
  "endTime": "Date",
  "distanceKm": 41,
  "consumptionKwh": 12,
  "avgSpeedKmh": 65,
  "startLocation": { "lat": 0, "lng": 0 },
  "endLocation": { "lat": 0, "lng": 0 }
}
```

### `tripLocations`

High-frequency GPS points during trips (separate collection to keep `trips` lean).

```json
{
  "tripId": "ObjectId",
  "timestamp": "Date",
  "latitude": 0,
  "longitude": 0,
  "speedKmh": 0
}
```

### `chargingSessions`

```json
{
  "vehicleId": "ObjectId",
  "startedAt": "Date",
  "endedAt": "Date?",
  "location": { "lat": 0, "lng": 0, "name": "string?" },
  "energyKwh": 32,
  "costUsd": 11.2,
  "source": "detected | manual"
}
```

### `favorites`

```json
{
  "userId": "ObjectId",
  "name": "Home",
  "latitude": 0,
  "longitude": 0,
  "icon": "home",
  "sortOrder": 0
}
```

### `maintenance`

```json
{
  "vehicleId": "ObjectId",
  "type": "tire_rotation | service | inspection",
  "dueAt": "Date",
  "completedAt": "Date?",
  "notes": "string?"
}
```

### `notifications`

```json
{
  "userId": "ObjectId",
  "type": "battery_low | charging_complete | unlocked",
  "title": "string",
  "body": "string",
  "readAt": "Date?",
  "createdAt": "Date"
}
```

### `settings`

Per-user key-value overrides (or embed in `users.preferences`).

### `aiInsights`

```json
{
  "userId": "ObjectId",
  "vehicleId": "ObjectId",
  "period": "weekly",
  "generatedAt": "Date",
  "summary": "string",
  "recommendations": ["string"]
}
```

### `analyticsRollups`

Pre-computed aggregates — **read on dashboard, write on cron**.

```json
{
  "vehicleId": "ObjectId",
  "period": "daily | weekly | monthly | yearly",
  "periodStart": "Date",
  "metrics": {
    "distanceKm": 0,
    "energyKwh": 0,
    "chargingCostUsd": 0,
    "avgEfficiencyWhPerKm": 0,
    "tripCount": 0
  }
}
```

Indexes: `vehicleId + period + periodStart` (unique)

## Sync pipeline

```text
Upstash QStash (schedules)
        │
        ▼ POST + signed
  /api/cron/sync-vehicle
        │
        ├─► Load users with valid Tesla tokens
        ├─► Refresh token if expired
        ├─► VehicleProvider.getVehicleSnapshot()
        ├─► Insert vehicleSnapshots
        ├─► Trip detector (compare odometer + location)
        ├─► Charging detector (chargingState transitions)
        └─► Alert evaluator (battery < 20%, etc.)
```

## Security

- OAuth tokens encrypted at rest (AES-256-GCM with `AUTH_SECRET` derived key).
- Cron routes verify **Upstash QStash** signatures (`upstash-signature` header).
- All Tesla/Gemini/Mapbox keys server-only (`process.env`).
- Auth.js session required for all `/api/*` except health and cron.

## Deployment

- **Platform:** Vercel
- **Cron:** Upstash QStash schedules → `npm run setup:qstash`
- **Env:** See `.env.example` (QSTASH_TOKEN, signing keys, QSTASH_CALLBACK_URL)
- **DB:** MongoDB Atlas (same region as Vercel deployment when possible)

## Visual system

**Theme:** Midnight Titanium

| Token | Value |
| ----- | ----- |
| Background | `#0F1115` |
| Surface | `#171A20` |
| Card | `#1E232B` |
| Primary | `#2D7FF9` |
| Accent (success/energy) | `#00D084` |
| Warning | `#F5A524` |
| Danger | `#E5484D` |

Font: Geist. Tabular numbers on all metrics. Border radius: 16px cards, 12px buttons.
