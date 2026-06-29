# DriveLens

**Understand Every Journey.**

Premium EV analytics dashboard — Next.js 16, MongoDB Atlas, Vercel.

## Quick start (demo mode)

No MongoDB or Tesla credentials required:

```bash
cp .env.example .env.local
npm install
npm run dev
```

Open [http://localhost:3000/login](http://localhost:3000/login) → **Continue with Demo**.

## Production setup

1. Set `DRIVELENS_MOCK_MODE=false` and configure `MONGODB_URI`
2. Register Tesla Fleet API app → `TESLA_CLIENT_ID`, `TESLA_CLIENT_SECRET`
3. Set `AUTH_SECRET` (32+ chars)
4. Add **Upstash QStash** from Vercel Marketplace → `QSTASH_TOKEN`, signing keys
5. Run `npm run setup:qstash` after deploy to register schedules
6. Optional: `GEMINI_API_KEY`, `MAPBOX_TOKEN`, `NEXT_PUBLIC_MAPBOX_TOKEN`

```bash
npm run seed   # MongoDB indexes + demo user (requires MONGODB_URI)
```

## Features

| Feature | Status |
| ------- | ------ |
| Auth (Demo, Tesla OAuth, Google) | ✅ |
| Vehicle sync (QStash 5-min + manual) | ✅ |
| Snapshots, trips, charging detection | ✅ |
| Analytics rollups | ✅ |
| Dashboard charts (Recharts) | ✅ |
| Maps (Mapbox / OSM fallback) | ✅ |
| Favorites + send to vehicle | ✅ |
| Gemini AI assistant | ✅ |
| Notifications | ✅ |
| Maintenance reminders | ✅ |
| PDF reports | ✅ |
| Vitest + GitHub Actions CI | ✅ |

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run test` | Vitest |
| `npm run lint` | ESLint |
| `npm run seed` | MongoDB indexes + demo user |
| `npm run setup:qstash` | Register Upstash QStash schedules |

## Docs

- [docs/PLAN.md](docs/PLAN.md) — development plan
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design
