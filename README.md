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

## Production (https://drive-lens-one.vercel.app)

Set in **Vercel → Project → Environment Variables** (Production):

| Variable | Value |
| -------- | ----- |
| `AUTH_URL` | `https://drive-lens-one.vercel.app` |
| `TESLA_REDIRECT_URI` | `https://drive-lens-one.vercel.app/api/auth/callback/tesla` |
| `QSTASH_CALLBACK_URL` | `https://drive-lens-one.vercel.app` |
| `DRIVELENS_MOCK_MODE` | `false` |
| `AUTH_SECRET` | (generate 32+ char secret) |
| `TESLA_CLIENT_ID` | From Tesla developer portal |
| `TESLA_CLIENT_SECRET` | From Tesla developer portal |
| `TESLA_FLEET_AUDIENCE` | `https://fleet-api.prd.eu.vn.cloud.tesla.com` |
| `TESLA_FLEET_PUBLIC_KEY_PEM` | EC public key (see Fleet onboarding below) |
| `TESLA_FLEET_PRIVATE_KEY_PEM` | EC private key (commands / virtual key — never commit) |

Tesla Developer Portal → **Allowed redirect URI:**

`https://drive-lens-one.vercel.app/api/auth/callback/tesla`

Local dev redirect (optional):

`http://localhost:3000/api/auth/callback/tesla`

After deploy: `npm run setup:qstash`

### Tesla Fleet API onboarding

1. `npm run generate:tesla-keys` — create EC key pair (prime256v1)
2. Set `TESLA_FLEET_PUBLIC_KEY_PEM` and `TESLA_FLEET_PRIVATE_KEY_PEM` in Vercel
3. Deploy — public key is served at `/.well-known/appspecific/com.tesla.3p.public-key.pem`
4. `npm run register:tesla-partner` — register partner account for your region (EU)

Use `--skip-url-check` if registering before the public key URL is live.

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
| `npm run generate:tesla-keys` | Generate Tesla Fleet EC key pair |
| `npm run register:tesla-partner` | Register Tesla Fleet API partner (EU/region) |

## Docs

- [docs/PLAN.md](docs/PLAN.md) — development plan
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — system design
