#!/usr/bin/env tsx
/**
 * Register DriveLens as a Tesla Fleet API partner (per region).
 *
 * Prerequisites:
 *   1. TESLA_CLIENT_ID, TESLA_CLIENT_SECRET
 *   2. TESLA_FLEET_AUDIENCE (EU: https://fleet-api.prd.eu.vn.cloud.tesla.com)
 *   3. AUTH_URL or TESLA_PARTNER_DOMAIN matching Tesla portal allowed origins
 *   4. TESLA_FLEET_PUBLIC_KEY_PEM deployed at /.well-known/... on that domain
 *
 * Usage:
 *   npm run register:tesla-partner
 *   npm run register:tesla-partner -- --skip-url-check
 *   npm run register:tesla-partner -- --domain drive-lens-one.vercel.app
 */
import { loadEnvFiles } from "./load-env";

loadEnvFiles();

function applyCliOverrides(): void {
  const domainIdx = process.argv.indexOf("--domain");
  if (domainIdx !== -1 && process.argv[domainIdx + 1]) {
    process.env.TESLA_PARTNER_DOMAIN = process.argv[domainIdx + 1];
  }
}

applyCliOverrides();

import {
  getTeslaFleetAudience,
  getTeslaPartnerDomain,
  getTeslaPublicKeyUrl,
} from "@/lib/env";
import { isValidEcPublicKeyPem, normalizePem } from "@/lib/tesla/pem";
import {
  fetchPartnerToken,
  registerPartnerAccount,
  verifyPartnerPublicKey,
} from "@/services/tesla/partner";

function hasFlag(flag: string): boolean {
  return process.argv.includes(flag);
}

async function checkPublicKeyReachable(publicKeyUrl: string): Promise<void> {
  const response = await fetch(publicKeyUrl, { redirect: "follow" });
  if (!response.ok) {
    throw new Error(
      `Public key not reachable at ${publicKeyUrl} (${response.status}). Deploy with TESLA_FLEET_PUBLIC_KEY_PEM first.`,
    );
  }

  const body = await response.text();
  if (!isValidEcPublicKeyPem(body)) {
    throw new Error(
      `URL ${publicKeyUrl} did not return a valid EC public key PEM`,
    );
  }

  console.log("Public key reachable and valid.");
}

async function main() {
  const domain = getTeslaPartnerDomain();
  const publicKeyUrl = getTeslaPublicKeyUrl();
  const audience = getTeslaFleetAudience();

  console.log("Tesla Fleet API partner registration");
  console.log(`  Region API:  ${audience}`);
  console.log(`  Domain:      ${domain}`);
  console.log(`  Public key:  ${publicKeyUrl}`);
  console.log("");

  const localPem = process.env.TESLA_FLEET_PUBLIC_KEY_PEM;
  if (!localPem || !isValidEcPublicKeyPem(localPem)) {
    throw new Error(
      "TESLA_FLEET_PUBLIC_KEY_PEM must be set locally (run npm run generate:tesla-keys)",
    );
  }
  console.log("Local TESLA_FLEET_PUBLIC_KEY_PEM is configured.");

  if (!hasFlag("--skip-url-check")) {
    await checkPublicKeyReachable(publicKeyUrl);
  } else {
    console.log("Skipping public key URL check (--skip-url-check).");
  }

  console.log("Requesting partner token...");
  const token = await fetchPartnerToken();
  console.log(`Partner token received (expires in ${token.expires_in}s).`);

  console.log("Registering partner account...");
  const registered = await registerPartnerAccount(token.access_token);
  console.log(`Registered domain: ${registered.domain}`);

  console.log("Verifying registration via public_key endpoint...");
  const verified = await verifyPartnerPublicKey(token.access_token, domain);
  console.log("Verification response:", JSON.stringify(verified, null, 2));

  const hostedPem = normalizePem(localPem);
  if (verified.public_key && verified.public_key.trim() !== hostedPem.trim()) {
    console.warn(
      "Warning: registered public key does not match TESLA_FLEET_PUBLIC_KEY_PEM locally.",
    );
  } else {
    console.log("Registration verified successfully.");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
