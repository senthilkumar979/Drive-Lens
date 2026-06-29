# DriveLens Development Plan

> **Product:** DriveLens — *Understand Every Journey.*  
> **Stack:** Next.js 16 · MongoDB Atlas · Vercel · Auth.js · Gemini · Mapbox  
> **Estimated timeline:** 10–14 weeks part-time (solo engineer)

---

## Table of contents

1. [Current status](#1-current-status)
2. [Phase 1 — Foundation](#2-phase-1--foundation)
3. [Phase 2 — Tesla integration](#3-phase-2--tesla-integration)
4. [Phase 3 — Data collection](#4-phase-3--data-collection)
5. [Phase 4 — Dashboard & insights](#5-phase-4--dashboard--insights)
6. [Phase 5 — Polish & production](#6-phase-5--polish--production)
7. [Cross-cutting concerns](#7-cross-cutting-concerns)
8. [Risk register](#8-risk-register)
9. [Future integrations](#9-future-integrations)
10. [Definition of done](#10-definition-of-done)

---

## 1. Current status

### ✅ Scaffolded (this commit)

| Area | Status |
| ---- | ------ |
| Next.js 16 + App Router + TypeScript | Done |
| Tailwind CSS v4 + Midnight Titanium theme | Done |
| shadcn/ui (sidebar, card, button, …) | Done |
| TanStack Query provider | Done |
| Folder structure (`app`, `components`, `features`, `lib`, `services`) | Done |
| Dashboard shell + sidebar navigation | Done |
| All page routes (placeholder) | Done |
| `VehicleProvider` interface + registry | Done |
| MongoDB client helper | Done |
| API stubs (`health`, `vehicle`, `cron/sync-vehicle`, `auth`) | Done |
| `vercel.json` cron schedule | Done |
| `.env.example` | Done |
| `docs/ARCHITECTURE.md` | Done |

### 🔲 Not yet implemented

Auth.js, Tesla OAuth, live data, charts, maps, AI, notifications, PDF reports, tests, CI, production deployment.

---

## 2. Phase 1 — Foundation

**Goal:** Authenticated app shell with database connectivity.  
**Duration:** ~1–2 weeks

### 2.1 Tooling

| Task | Details | Acceptance criteria |
| ---- | ------- | ------------------- |
| Prettier | `npm run format` | All TS/TSX formatted consistently |
| Husky + lint-staged | Pre-commit lint + format | Bad commits blocked locally |
| ESLint rules | Align with project conventions | `npm run lint` passes |
| Path aliases | `@/*` verified | No relative import hell |

```bash
npm install -D husky lint-staged
npx husky init
```

### 2.2 MongoDB Atlas

| Task | Details | Acceptance criteria |
| ---- | ------- | ------------------- |
| Create Atlas cluster | Free tier OK for dev | Connection string in `.env.local` |
| Network access | Allow Vercel IPs or `0.0.0.0/0` for dev | `getDb()` connects without error |
| Seed script | `scripts/seed.ts` with sample user | Script runs via `npx tsx scripts/seed.ts` |
| Collection indexes | Per ARCHITECTURE.md | Indexes created in seed or migration script |

**Files to create:**

```
scripts/seed.ts
lib/db/collections.ts          # collection name constants
lib/db/indexes.ts              # index definitions
```

### 2.3 Auth.js (NextAuth v5)

| Task | Details | Acceptance criteria |
| ---- | ------- | ------------------- |
| Install & configure Auth.js | `lib/auth/config.ts`, `lib/auth/index.ts` | Session available in server components |
| Tesla OAuth provider | Fleet API OAuth flow | User can sign in with Tesla |
| Google provider (optional) | Standard OAuth | Secondary login works |
| Session strategy | JWT or database — JWT recommended for Vercel | Session persists across refreshes |
| Protect routes | Middleware or layout guard | `/dashboard/*` requires auth |
| Login page | `app/(auth)/login/page.tsx` | Unauthenticated users redirected |

**Tesla OAuth notes:**

1. Register app at [Tesla Developer](https://developer.tesla.com/).
2. Request Fleet API access (may require approval).
3. Scopes: `openid`, `offline_access`, vehicle_data, vehicle_cmds (as needed).
4. Store `refresh_token` encrypted in `users.teslaAccount`.

**Files to create:**

```
lib/auth/config.ts             # extend existing stub
lib/auth/index.ts              # export { auth, signIn, signOut }
middleware.ts                  # route protection
app/(auth)/login/page.tsx
app/(auth)/layout.tsx
lib/crypto/token-encryption.ts # AES-256-GCM for tokens
```

### 2.4 Base layout polish

| Task | Details | Acceptance criteria |
| ---- | ------- | ------------------- |
| User menu in sidebar footer | Avatar, sign out | Shows logged-in user |
| Loading states | `app/(dashboard)/loading.tsx` | Skeleton while pages load |
| Error boundary | `app/(dashboard)/error.tsx` | Graceful error UI |
| 404 page | `app/not-found.tsx` | Branded not-found |

### Phase 1 exit criteria

- [ ] User signs in with Tesla OAuth
- [ ] Session persists; protected routes work
- [ ] MongoDB connected; seed script runs
- [ ] Dashboard shell renders for authenticated user
- [ ] `npm run build` succeeds
- [ ] `npm run lint` passes

---

## 3. Phase 2 — Tesla integration

**Goal:** Live vehicle data + automated 5-minute sync.  
**Duration:** ~2–3 weeks

### 3.1 Tesla service layer

| Task | Details | Acceptance criteria |
| ---- | ------- | ------------------- |
| `services/tesla/client.ts` | HTTP client with retry, timeout | Handles 401/429 gracefully |
| `services/tesla/api.ts` | Fleet API endpoints | `listVehicles`, `getVehicleData` |
| `services/tesla/types.ts` | Raw Tesla response types | Full type coverage |
| `services/tesla/mapper.ts` | Tesla → `VehicleSnapshot` | Normalized output |
| Token refresh | Auto-refresh on 401 | Sync never fails silently on expired token |

**Files:**

```
services/tesla/client.ts
services/tesla/api.ts
services/tesla/types.ts
services/tesla/mapper.ts
services/tesla/token.ts          # refresh logic
```

### 3.2 Tesla VehicleProvider

| Task | Details | Acceptance criteria |
| ---- | ------- | ------------------- |
| `lib/providers/vehicle/tesla/index.ts` | Implements `VehicleProvider` | Registered in registry |
| Unit tests for mapper | Vitest | Mapper tests pass |

```
lib/providers/vehicle/tesla/index.ts
lib/providers/vehicle/tesla/tesla-provider.ts
features/vehicle/services/vehicle-service.ts
```

### 3.3 API routes

| Route | Method | Purpose |
| ----- | ------ | ------- |
| `/api/vehicle` | GET | Latest snapshot + metadata |
| `/api/vehicle/sync` | POST | Manual sync trigger |
| `/api/vehicle/list` | GET | User's vehicles |

### 3.4 Vehicle page UI

| Component | Data source |
| --------- | ----------- |
| Battery gauge | Latest snapshot |
| Range display | Latest snapshot |
| Lock status | Latest snapshot |
| Climate temps | Latest snapshot |
| Last sync timestamp | Snapshot `timestamp` |
| Manual sync button | POST `/api/vehicle/sync` |

Use TanStack Query: `useQuery(['vehicle', id])`, `useMutation` for sync.

### 3.5 Cron: sync-vehicle

Implement `app/api/cron/sync-vehicle/route.ts`:

```text
1. Verify CRON_SECRET
2. For each user with valid Tesla token:
   a. Refresh token if needed
   b. List vehicles → upsert `vehicles` collection
   c. Fetch vehicle data → insert `vehicleSnapshots`
   d. Log sync result
3. Return summary { usersProcessed, snapshotsInserted, errors }
```

**Vercel setup:**

- Set `CRON_SECRET` in Vercel env
- Deploy; verify cron runs in Vercel dashboard

### 3.6 Dashboard live metrics

Replace placeholder `MetricCard` values with real data from latest snapshot.

### Phase 2 exit criteria

- [ ] Vehicle page shows live battery, range, temp, lock status
- [ ] Manual sync works
- [ ] Cron inserts snapshots every 5 minutes
- [ ] Token refresh works automatically
- [ ] Dashboard top metrics show real values
- [ ] No Tesla API keys exposed to client

---

## 4. Phase 3 — Data collection

**Goal:** Trips, charging sessions, and pre-aggregated analytics.  
**Duration:** ~2–3 weeks

### 4.1 Trip detection

**Algorithm (run after each sync):**

```text
IF vehicle was moving (speed > 5 km/h OR odometer increasing):
  IF no active trip → create trip with startTime, startLocation
  ELSE → append point to tripLocations
IF vehicle stopped for > 10 minutes AND active trip exists:
  → close trip (endTime, endLocation, compute distance/consumption)
```

| Task | File |
| ---- | ---- |
| Trip detector | `lib/jobs/trip-detector.ts` |
| Trip service | `features/trip/services/trip-service.ts` |
| API | `app/api/trips/route.ts`, `app/api/trips/[id]/route.ts` |

### 4.2 Charging session detection

Detect transitions: `Disconnected → Charging → Complete`

| Task | File |
| ---- | ---- |
| Charging detector | `lib/jobs/charging-detector.ts` |
| Charging service | `features/charging/services/charging-service.ts` |
| API | `app/api/charging/route.ts` |

### 4.3 Analytics aggregation

Cron job: `/api/cron/aggregate-analytics` (daily at 00:05 UTC)

For each vehicle, compute and upsert `analyticsRollups`:

| Period | Metrics |
| ------ | ------- |
| Daily | distanceKm, energyKwh, tripCount, avgEfficiency |
| Weekly | same + chargingCostUsd |
| Monthly | same + CO₂ saved estimate |
| Yearly | same |

| Task | File |
| ---- | ---- |
| Aggregator | `lib/jobs/analytics-aggregator.ts` |
| API | `app/api/analytics/route.ts` |
| Cron | `app/api/cron/aggregate-analytics/route.ts` |

### 4.4 Trips & charging pages

| Page | Features |
| ---- | -------- |
| `/trips` | Sortable table, date filter, trip detail drawer |
| `/charging` | Session list, cost summary, location column |
| `/analytics` | Period selector (D/W/M/Y), metric cards |

### Phase 3 exit criteria

- [ ] Trips auto-detected from sync data
- [ ] Charging sessions recorded with energy kWh
- [ ] Analytics rollups computed daily
- [ ] Trips, charging, analytics pages show real data
- [ ] Trip detail shows route metadata (map in Phase 4)

---

## 5. Phase 4 — Dashboard & insights

**Goal:** Charts, maps, favorites, AI assistant.  
**Duration:** ~2–3 weeks

### 5.1 Charts (Recharts)

| Chart | Page | Data source |
| ----- | ---- | ----------- |
| Battery history (line) | Dashboard | `vehicleSnapshots` (24h/7d) |
| Distance over time | Analytics | `analyticsRollups` |
| Charging cost | Analytics / Charging | `chargingSessions` |
| Temperature | Dashboard | `vehicleSnapshots` |
| Efficiency (Wh/km) | Analytics | `analyticsRollups` |
| Trip heatmap | Analytics | `tripLocations` aggregated |

**Shared:**

```
components/charts/line-chart.tsx
components/charts/bar-chart.tsx
features/analytics/components/battery-chart.tsx
```

Animate on first render only (per design spec).

### 5.2 Maps (Mapbox GL)

| Feature | Implementation |
| ------- | -------------- |
| Vehicle location | Dashboard map card |
| Trip route replay | `/trips/[id]` with progress slider |
| Charging locations | Charging page map pins |

```
features/trip/components/trip-map.tsx
features/trip/components/route-replay.tsx
components/maps/vehicle-map.tsx
```

Env: `MAPBOX_TOKEN` (server-side proxy or public token with URL restrictions).

### 5.3 Favorites

| Task | Details |
| ---- | ------- |
| CRUD favorites | `features/favorites/` |
| API | `/api/favorites` |
| Send to Tesla | POST `/api/navigation` → `VehicleProvider.sendNavigation()` |
| UI | Grid of favorite cards with "Send to vehicle" button |

Preset icons: Home, Office, Gym, Airport, Hotel, Custom.

### 5.4 AI (Gemini)

| Task | Details |
| ---- | ------- |
| `services/gemini/client.ts` | Gemini API wrapper |
| `services/gemini/prompts.ts` | System prompts per insight type |
| Cron `/api/cron/ai-insights` | Weekly batch generation |
| `/assistant` page | Chat UI with context from rollups + recent trips |
| Dashboard AI card | Latest weekly insight summary |

**Example prompts:**

- "Explain this week's battery usage"
- "Compare efficiency vs last month"
- "Find inefficient trips"
- "Suggest optimal charging time"

Store results in `aiInsights` collection.

### 5.5 Dashboard completion

Full layout per design spec:

```text
┌──────────────────────────────────────────┐
│ Battery    Range    Temperature  Sync    │
├──────────────────────────────────────────┤
│         Battery Trend (Line Chart)       │
├──────────────┬───────────────────────────┤
│ Recent Trips │ Charging Analytics        │
├──────────────┼───────────────────────────┤
│ Vehicle Map  │ AI Insights               │
└──────────────┴───────────────────────────┘
```

Micro-interactions:

- Card hover lift (2–4px)
- Count-up number transitions (Framer Motion)
- Battery pulse while charging
- Live status breathing indicator

### Phase 4 exit criteria

- [ ] All specified charts render with real data
- [ ] Map shows vehicle location
- [ ] Trip route replay with slider
- [ ] Favorites CRUD + send to vehicle
- [ ] AI insights on dashboard and assistant page
- [ ] Framer Motion micro-interactions applied

---

## 6. Phase 5 — Polish & production

**Goal:** Production-ready SaaS quality.  
**Duration:** ~2 weeks

### 6.1 Notifications

| Alert | Trigger |
| ----- | ------- |
| Battery below 20% | Snapshot `batteryLevel < 20` |
| Charging complete | `chargingState` → Complete |
| Vehicle unlocked | `locked` false while away from home |
| Windows open | Tesla vehicle_data (if available) |
| Software update | Tesla API signal |
| Leaving home / entering work | Geofence on favorites |

```
lib/jobs/alert-evaluator.ts
features/notifications/
app/api/notifications/route.ts
```

Delivery: in-app notification center first; email (Resend) optional.

### 6.2 Maintenance

```
features/maintenance/
  components/maintenance-list.tsx
  schemas/maintenance-schema.ts
  services/maintenance-service.ts
```

Manual entry + due-date reminders.

### 6.3 Reports (PDF)

Monthly PDF via `@react-pdf/renderer` or Puppeteer on Vercel:

- Trips summary
- Costs
- Charging breakdown
- Efficiency
- CO₂ saved (estimate: kWh × grid factor)
- Maintenance log

```
features/reports/
app/api/reports/generate/route.ts
app/api/cron/generate-reports/route.ts  # 1st of month
```

### 6.4 Testing

| Layer | Tool | Coverage target |
| ----- | ---- | --------------- |
| Unit | Vitest | Mappers, detectors, aggregators |
| Component | RTL + Vitest | MetricCard, charts |
| E2E | Playwright (optional) | Auth flow, dashboard load |

```bash
npm install -D vitest @testing-library/react @vitejs/plugin-react jsdom
```

### 6.5 CI/CD

GitHub Actions:

```yaml
# .github/workflows/ci.yml
- lint
- typecheck (tsc --noEmit)
- test
- build
```

Vercel: auto-deploy `main` → production, PRs → preview.

### 6.6 Monitoring

| Tool | Purpose |
| ---- | ------- |
| Vercel Analytics | Web vitals |
| Sentry (optional) | Error tracking |
| Cron logs | Vercel function logs |

### 6.7 Responsive UI

- Mobile sidebar → sheet (shadcn Sheet already installed)
- Dashboard grid: 1 col mobile, 2 col tablet, 4 col desktop
- Touch-friendly chart interactions

### 6.8 Cleanup cron

`/api/cron/cleanup` — monthly:

- Delete `vehicleSnapshots` older than 2 years
- Delete `tripLocations` for closed trips older than 1 year
- Archive old `aiInsights`

### Phase 5 exit criteria

- [ ] Notifications fire for defined alerts
- [ ] Monthly PDF report generates
- [ ] Vitest suite passes in CI
- [ ] Deployed to Vercel production
- [ ] Responsive on mobile
- [ ] Error monitoring configured

---

## 7. Cross-cutting concerns

### Feature module pattern

Each feature under `features/<name>/`:

```
features/vehicle/
  components/     # UI components
  hooks/          # useVehicle, useVehicleSync
  services/       # Business logic (server)
  types/          # Feature-specific types
  schemas/        # Zod validation
  actions/        # Server Actions (optional)
```

### Server vs client boundary

| Server only | Client OK |
| ----------- | --------- |
| Tesla API calls | Chart rendering |
| MongoDB queries | Form interactions |
| Token storage | TanStack Query hooks |
| Gemini calls | Map interactions |
| Cron jobs | Animations |

### Error handling

- API routes return `{ error: string, code: string }` with proper HTTP status
- TanStack Query `queryFn` throws user-friendly errors
- Global error boundary on dashboard layout

### Zod schemas

Centralize in `schemas/` and feature `schemas/`:

```
schemas/user.ts
schemas/vehicle-snapshot.ts
features/trip/schemas/trip-schema.ts
```

---

## 8. Risk register

| Risk | Impact | Mitigation |
| ---- | ------ | ---------- |
| Tesla Fleet API access delayed | Blocks Phase 2 | Apply early; use mock provider for dev |
| Tesla API rate limits | Sync failures | 5-min interval; backoff on 429 |
| Vercel cron cold starts | Slow sync | Keep functions lean; monitor duration |
| MongoDB time-series volume | Cost at scale | TTL indexes; rollup pre-aggregation |
| Token encryption key rotation | Auth breakage | Version encryption; migration path |
| Mapbox costs | Budget | Tile caching; usage limits |
| Gemini API costs | Budget | Batch weekly insights; cache responses |

---

## 9. Future integrations

| Integration | Phase | Notes |
| ----------- | ----- | ----- |
| Apple Shortcuts | Post-5 | Webhook API for vehicle status |
| Home Assistant | Post-5 | MQTT or REST bridge |
| IFTTT | Post-5 | Trigger on alerts |
| Google Calendar | Post-5 | Trip → calendar event |
| Notion | Post-5 | Monthly report sync |
| Rivian provider | Post-5 | Second `VehicleProvider` |
| Polestar provider | Post-5 | Third provider |

---

## 10. Definition of done

A feature is **done** when:

1. Code merged to `main`
2. Types strict (no `any`)
3. Zod validation on API inputs
4. Error states handled in UI
5. Works on mobile viewport
6. `npm run build` passes
7. Relevant tests pass (Phase 5+)
8. Documented in code or `docs/` if non-obvious

---

## Quick reference: next 5 tasks

Start here after reading this plan:

1. **MongoDB Atlas** — create cluster, add `MONGODB_URI` to `.env.local`
2. **Auth.js + Tesla OAuth** — complete `lib/auth/config.ts`, login page, middleware
3. **Tesla service layer** — `services/tesla/*` with mapper tests
4. **Implement cron sync** — real snapshot inserts
5. **Vehicle page** — live metrics with TanStack Query

```bash
cp .env.example .env.local
npm run dev
# → http://localhost:3000/dashboard
```

---

*Last updated: scaffold commit — Phase 1 in progress*
