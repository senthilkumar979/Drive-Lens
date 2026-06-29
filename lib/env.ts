export function isMockMode(): boolean {
  return (
    process.env.DRIVELENS_MOCK_MODE === "true" || !process.env.MONGODB_URI
  );
}

export function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    if (isMockMode()) return "drivelens-mock-dev-secret-min-32-chars";
    throw new Error("AUTH_SECRET is not defined");
  }
  return secret;
}

export function hasTeslaCredentials(): boolean {
  return Boolean(
    process.env.TESLA_CLIENT_ID && process.env.TESLA_CLIENT_SECRET,
  );
}

export function hasGeminiKey(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

export function hasMapboxToken(): boolean {
  return Boolean(process.env.MAPBOX_TOKEN);
}

/** Regional Fleet API base URL — token audience must match this (EU default) */
export function getTeslaFleetAudience(): string {
  return (
    process.env.TESLA_FLEET_AUDIENCE ??
    process.env.TESLA_FLEET_API_URL ??
    "https://fleet-api.prd.eu.vn.cloud.tesla.com"
  );
}

export function getTeslaFleetApiUrl(): string {
  return getTeslaFleetAudience();
}

/** Token exchange + refresh — NOT auth.tesla.com */
export function getTeslaFleetAuthUrl(): string {
  return (
    process.env.TESLA_FLEET_AUTH_URL ??
    "https://fleet-auth.prd.vn.cloud.tesla.com/oauth2/v3"
  );
}

const TESLA_PUBLIC_KEY_PATH =
  "/.well-known/appspecific/com.tesla.3p.public-key.pem";

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".local")
  );
}

function normalizeHostname(value: string): string {
  return value.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function isLocalAuthUrl(url: string): boolean {
  try {
    const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    return isLocalHostname(new URL(withProtocol).hostname);
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1");
  }
}

/**
 * Public app URL for Auth.js callbacks. On Vercel, ignores localhost AUTH_URL
 * and uses the deployment hostname instead.
 */
export function getAuthUrl(): string {
  const explicit = process.env.AUTH_URL?.trim();

  if (process.env.VERCEL === "1") {
    const vercelHost =
      process.env.VERCEL_ENV === "production"
        ? process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim()
        : process.env.VERCEL_URL?.trim();

    if (vercelHost && (!explicit || isLocalAuthUrl(explicit))) {
      return parseOrigin(vercelHost);
    }
  }

  if (explicit) return explicit.replace(/\/$/, "");
  return "http://localhost:3000";
}

/** Ensure Auth.js reads the resolved URL (not a stale localhost AUTH_URL on Vercel). */
export function applyAuthUrlEnv(): void {
  process.env.AUTH_URL = getAuthUrl();
}

function parseOrigin(value: string): string {
  const trimmed = value.trim();
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return new URL(withProtocol).origin;
}

function collectOriginCandidates(): string[] {
  const candidates: Array<string | undefined> = [
    process.env.TESLA_PARTNER_DOMAIN?.trim(),
    process.env.QSTASH_CALLBACK_URL?.trim(),
    process.env.TESLA_REDIRECT_URI?.trim()
      ? new URL(process.env.TESLA_REDIRECT_URI.trim()).origin
      : undefined,
    getAuthUrl(),
  ];

  return candidates
    .filter((value): value is string => Boolean(value))
    .map((value) => parseOrigin(value));
}

function resolveTeslaAppOrigin(options?: { preferPublic?: boolean }): string {
  const origins = collectOriginCandidates();
  if (origins.length === 0) {
    throw new Error(
      "Set one of: TESLA_PARTNER_DOMAIN, QSTASH_CALLBACK_URL, TESLA_REDIRECT_URI, or AUTH_URL",
    );
  }

  if (options?.preferPublic) {
    const publicOrigin = origins.find(
      (origin) => !isLocalHostname(new URL(origin).hostname),
    );
    if (publicOrigin) return publicOrigin;
    throw new Error(
      "Partner registration needs a public domain (not localhost). Set TESLA_PARTNER_DOMAIN=drive-lens-one.vercel.app or add TESLA_REDIRECT_URI with your production URL.",
    );
  }

  return origins[0];
}

/** Hostname used for Fleet API partner registration (no protocol). */
export function getTeslaPartnerDomain(): string {
  const explicit = process.env.TESLA_PARTNER_DOMAIN?.trim();
  if (explicit) return normalizeHostname(explicit);

  return new URL(resolveTeslaAppOrigin({ preferPublic: true })).hostname;
}

export function getTeslaPublicKeyUrl(): string {
  return `${resolveTeslaAppOrigin({ preferPublic: true })}${TESLA_PUBLIC_KEY_PATH}`;
}

export function getTeslaPublicKeyPath(): string {
  return TESLA_PUBLIC_KEY_PATH;
}

export function getTeslaFleetPublicKeyPem(): string | undefined {
  const raw = process.env.TESLA_FLEET_PUBLIC_KEY_PEM?.trim();
  return raw || undefined;
}

export function getTeslaFleetPrivateKeyPem(): string | undefined {
  const raw = process.env.TESLA_FLEET_PRIVATE_KEY_PEM?.trim();
  return raw || undefined;
}

