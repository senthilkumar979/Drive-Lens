import { customFetch } from "@auth/core";
import type { OAuthConfig } from "next-auth/providers";
import { getTeslaFleetAuthUrl } from "@/lib/env";
import { encryptToken } from "@/lib/crypto/encryption";
import { upsertUser } from "@/lib/db/repositories";
import { teslaOAuthFetch } from "./tesla-fetch";

interface TeslaProfile {
  email?: string;
  name?: string;
  sub?: string;
}

const TESLA_SCOPES =
  "openid offline_access user_data vehicle_device_data vehicle_cmds vehicle_location";

export const teslaProvider: OAuthConfig<TeslaProfile> = {
  id: "tesla",
  name: "Tesla",
  type: "oauth",
  clientId: process.env.TESLA_CLIENT_ID,
  clientSecret: process.env.TESLA_CLIENT_SECRET,
  client: {
    token_endpoint_auth_method: "client_secret_post",
  },
  authorization: {
    url: "https://auth.tesla.com/oauth2/v3/authorize",
    params: {
      scope: TESLA_SCOPES,
      locale: "en-US",
      prompt: "login",
    },
  },
  token: {
    url: `${getTeslaFleetAuthUrl()}/token`,
  },
  [customFetch]: teslaOAuthFetch,
  userinfo: "https://auth.tesla.com/oauth2/v3/userinfo",
  profile(profile) {
    return {
      id: profile.sub ?? "tesla-user",
      email: profile.email ?? "tesla@drivelens.app",
      name: profile.name ?? "Tesla Driver",
    };
  },
  checks: ["pkce"],
};

export async function persistTeslaTokens(
  email: string,
  name: string,
  accessToken: string,
  refreshToken?: string,
  expiresAt?: number,
): Promise<string> {
  const user = await upsertUser({
    email,
    name,
    teslaAccount: {
      accessToken: encryptToken(accessToken),
      refreshToken: refreshToken ? encryptToken(refreshToken) : undefined,
      expiresAt: expiresAt ? new Date(expiresAt * 1000) : undefined,
    },
    preferences: {
      units: "metric",
      notifications: {
        batteryLow: true,
        chargingComplete: true,
        vehicleUnlocked: true,
      },
    },
  });
  return typeof user._id === "string" ? user._id : user._id.toString();
}
