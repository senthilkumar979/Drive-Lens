import {
  getTeslaFleetApiUrl,
  getTeslaFleetAuthUrl,
} from "@/lib/env";

const TESLA_FLEET_BASE = getTeslaFleetApiUrl();
const TESLA_TOKEN_URL = `${getTeslaFleetAuthUrl()}/token`;

export async function teslaFetch<T>(
  path: string,
  accessToken: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${TESLA_FLEET_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tesla API error ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}

export async function refreshTeslaToken(refreshToken: string): Promise<{
  access_token: string;
  refresh_token?: string;
  expires_in: number;
}> {
  const response = await fetch(TESLA_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: process.env.TESLA_CLIENT_ID ?? "",
      client_secret: process.env.TESLA_CLIENT_SECRET ?? "",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Tesla token refresh failed: ${response.status} ${text}`);
  }

  return response.json();
}
