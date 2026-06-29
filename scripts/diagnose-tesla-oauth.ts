import { loadEnvFiles } from "./load-env";
import { getTeslaFleetAudience, getTeslaFleetAuthUrl } from "@/lib/env";
import { teslaOAuthFetch } from "@/lib/auth/providers/tesla-fetch";

loadEnvFiles();

const redirect = "https://drive-lens-one.vercel.app/api/auth/callback/tesla";
const audience = getTeslaFleetAudience();
const tokenUrl = `${getTeslaFleetAuthUrl()}/token`;

async function exchange(
  label: string,
  options: {
    useTeslaFetch?: boolean;
    audienceInBody?: boolean;
    audienceOnUrl?: boolean;
    codeVerifier?: string;
  },
) {
  const {
    useTeslaFetch = false,
    audienceInBody = false,
    audienceOnUrl = false,
    codeVerifier,
  } = options;

  const url = audienceOnUrl
    ? `${tokenUrl}?audience=${encodeURIComponent(audience)}`
    : tokenUrl;
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.TESLA_CLIENT_ID ?? "",
    client_secret: process.env.TESLA_CLIENT_SECRET ?? "",
    code: "diagnostic-fake-code",
    redirect_uri: redirect,
  });
  if (audienceInBody) body.set("audience", audience);
  if (codeVerifier) body.set("code_verifier", codeVerifier);

  const fetchFn = useTeslaFetch ? teslaOAuthFetch : fetch;
  const res = await fetchFn(url, { method: "POST", body });
  const text = await res.text();

  console.log(`--- ${label}`);
  console.log(`request URL: ${url}`);
  console.log(`POST body audience: ${body.get("audience") ?? "MISSING"}`);
  console.log(`POST body code_verifier: ${body.has("code_verifier") ? "present" : "MISSING"}`);
  console.log(`status: ${res.status}`);
  console.log(`response: ${text}`);
  console.log("");
}

async function main() {
  if (!process.env.TESLA_CLIENT_ID || !process.env.TESLA_CLIENT_SECRET) {
    console.error("TESLA_CLIENT_ID / TESLA_CLIENT_SECRET not set in env");
    process.exit(1);
  }

  console.log("Tesla OAuth token exchange diagnostic");
  console.log(`audience: ${audience}`);
  console.log(`redirect_uri: ${redirect}`);
  console.log("");

  await exchange("OLD Auth.js (audience on URL query only)", {
    audienceOnUrl: true,
  });
  await exchange("NEW teslaOAuthFetch (injects audience in body)", {
    useTeslaFetch: true,
  });
  await exchange("Manual correct (audience in POST body)", {
    audienceInBody: true,
  });
  await exchange("NO audience anywhere", {});
  await exchange("With PKCE verifier but fake code", {
    audienceInBody: true,
    codeVerifier: "fake-verifier-12345",
  });

  // Wrong redirect_uri test
  const wrongRedirect = "https://wrong.example.com/callback";
  const wrongBody = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.TESLA_CLIENT_ID ?? "",
    client_secret: process.env.TESLA_CLIENT_SECRET ?? "",
    code: "diagnostic-fake-code",
    redirect_uri: wrongRedirect,
    audience,
  });
  const wrongRes = await fetch(tokenUrl, { method: "POST", body: wrongBody });
  console.log("--- Wrong redirect_uri");
  console.log(`redirect_uri: ${wrongRedirect}`);
  console.log(`status: ${wrongRes.status}`);
  console.log(`response: ${await wrongRes.text()}`);
  console.log("");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
