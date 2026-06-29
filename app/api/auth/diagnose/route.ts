import { NextResponse } from "next/server";
import {
  getAuthUrl,
  getTeslaFleetAudience,
  getTeslaFleetAuthUrl,
  hasTeslaCredentials,
} from "@/lib/env";
import { isDatabaseConnected } from "@/lib/db/mongodb";
import { teslaOAuthFetch } from "@/lib/auth/providers/tesla-fetch";

const REDIRECT_URI = `${getAuthUrl()}/api/auth/callback/tesla`;

async function probeTokenExchange(useTeslaFetch: boolean) {
  const tokenUrl = `${getTeslaFleetAuthUrl()}/token`;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.TESLA_CLIENT_ID ?? "",
    client_secret: process.env.TESLA_CLIENT_SECRET ?? "",
    code: "diagnostic-probe-not-a-real-code",
    redirect_uri: REDIRECT_URI,
  });

  const fetchFn = useTeslaFetch ? teslaOAuthFetch : fetch;
  const response = await fetchFn(tokenUrl, { method: "POST", body });
  const payload = (await response.json()) as {
    error?: string;
    error_description?: string;
  };

  return {
    status: response.status,
    bodyAudience: body.get("audience") ?? null,
    teslaError: payload.error ?? null,
    teslaErrorDescription: payload.error_description ?? null,
  };
}

/**
 * OAuth troubleshooting — no secrets in response.
 * Compare Tesla error codes to interpret server credentials vs callback issues.
 */
export async function GET() {
  const databaseConnected = await isDatabaseConnected();

  if (!hasTeslaCredentials()) {
    return NextResponse.json({
      ok: false,
      reason: "TESLA_CLIENT_ID or TESLA_CLIENT_SECRET missing on this deployment",
      databaseConnected,
      authUrl: getAuthUrl(),
    });
  }

  const withoutAudienceInjection = await probeTokenExchange(false);
  const withAudienceInjection = await probeTokenExchange(true);

  const credentialsOk =
    withoutAudienceInjection.teslaError === "invalid_auth_code" ||
    withAudienceInjection.teslaError === "invalid_auth_code";

  const credentialsRejected =
    withoutAudienceInjection.teslaError === "unauthorized_client" ||
    withAudienceInjection.teslaError === "unauthorized_client";

  let interpretation: string;
  if (credentialsRejected) {
    interpretation =
      "TESLA_CLIENT_ID / TESLA_CLIENT_SECRET on this server are rejected by Tesla (unauthorized_client). Fix Vercel env — special characters in the secret must match exactly.";
  } else if (credentialsOk) {
    interpretation =
      "Tesla accepts these client credentials. A real login failure is likely invalid/expired auth code, missing PKCE cookie (copied link / different browser), or userinfo after token exchange. Auth.js shows this as error=Configuration in the URL.";
  } else {
    interpretation =
      "Unexpected Tesla token response — check teslaError fields below.";
  }

  return NextResponse.json({
    ok: credentialsOk,
    interpretation,
    authUrl: getAuthUrl(),
    redirectUri: REDIRECT_URI,
    fleetAudience: getTeslaFleetAudience(),
    databaseConnected,
    authJsConfigurationMasking:
      "CallbackRouteError and InvalidCheck (PKCE) are hidden from the browser as error=Configuration. Enable AUTH_DEBUG=true and read Vercel function logs for [auth][details].",
    probes: {
      plainFetchNoAudienceInBody: withoutAudienceInjection,
      teslaOAuthFetchInjectsAudience: withAudienceInjection,
    },
    commonLogLines: {
      tokenExchangeFailed:
        "[auth][error] CallbackRouteError … [auth][details]: invalid_auth_code",
      pkceMissing:
        "[auth][error] InvalidCheck: pkceCodeVerifier cookie was missing",
      pkceConsumed:
        "[auth][error] InvalidCheck: pkceCodeVerifier value could not be parsed (cookie already used or wrong AUTH_SECRET)",
      wrongSecret:
        "Tesla token error unauthorized_client (client_id + client_secret rejected)",
    },
  });
}
