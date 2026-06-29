import {
  getTeslaFleetApiUrl,
  getTeslaFleetAudience,
  getTeslaFleetAuthUrl,
  getTeslaPartnerDomain,
  getTeslaPublicKeyUrl,
} from "@/lib/env";
import { teslaFetch } from "@/services/tesla/client";

const PARTNER_SCOPES =
  "openid vehicle_device_data vehicle_cmds vehicle_charging_cmds vehicle_location";

interface PartnerTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface TeslaPartnerResponse<T> {
  response?: T;
  error?: string;
  error_description?: string;
}

interface RegisterPartnerResult {
  domain: string;
  publicKeyUrl: string;
}

interface PartnerPublicKeyResult {
  public_key?: string;
  domain?: string;
}

export async function fetchPartnerToken(): Promise<PartnerTokenResponse> {
  const clientId = process.env.TESLA_CLIENT_ID;
  const clientSecret = process.env.TESLA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("TESLA_CLIENT_ID and TESLA_CLIENT_SECRET are required");
  }

  const tokenUrl = `${getTeslaFleetAuthUrl()}/token`;
  const response = await fetch(tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      scope: PARTNER_SCOPES,
      audience: getTeslaFleetAudience(),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Partner token request failed: ${response.status} ${text}`);
  }

  return response.json() as Promise<PartnerTokenResponse>;
}

export async function registerPartnerAccount(
  partnerToken: string,
): Promise<RegisterPartnerResult> {
  const domain = getTeslaPartnerDomain();
  const publicKeyUrl = getTeslaPublicKeyUrl();

  const body = {
    domain,
    public_key: publicKeyUrl,
  };

  const result = await teslaFetch<TeslaPartnerResponse<unknown>>(
    "/api/1/partner_accounts",
    partnerToken,
    {
      method: "POST",
      body: JSON.stringify(body),
    },
  );

  if (result.error) {
    throw new Error(
      `Partner registration failed: ${result.error} — ${result.error_description ?? ""}`,
    );
  }

  return { domain, publicKeyUrl };
}

export async function verifyPartnerPublicKey(
  partnerToken: string,
  domain?: string,
): Promise<PartnerPublicKeyResult> {
  const partnerDomain = domain ?? getTeslaPartnerDomain();
  const fleetBase = getTeslaFleetApiUrl();

  const response = await fetch(
    `${fleetBase}/api/1/partner_accounts/public_key?domain=${encodeURIComponent(partnerDomain)}`,
    {
      headers: {
        Authorization: `Bearer ${partnerToken}`,
        "Content-Type": "application/json",
      },
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Public key verification failed: ${response.status} ${text}`);
  }

  const json = (await response.json()) as TeslaPartnerResponse<PartnerPublicKeyResult>;
  if (json.error) {
    throw new Error(
      `Public key verification failed: ${json.error} — ${json.error_description ?? ""}`,
    );
  }

  return json.response ?? {};
}
