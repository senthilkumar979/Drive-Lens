#!/usr/bin/env tsx
/**
 * Generate EC key pair (prime256v1) for Tesla Fleet API / Vehicle Commands.
 *
 * Usage:
 *   npm run generate:tesla-keys
 *   npm run generate:tesla-keys -- --out ./local-tesla-keys
 *
 * Never commit private keys. Set env vars from the printed output.
 */
import { generateKeyPairSync } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

function parseOutDir(): string | undefined {
  const idx = process.argv.indexOf("--out");
  if (idx === -1 || !process.argv[idx + 1]) return undefined;
  return resolve(process.argv[idx + 1]);
}

function toEnvValue(pem: string): string {
  return pem.trim().replace(/\n/g, "\\n");
}

function main() {
  const { publicKey, privateKey } = generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "sec1", format: "pem" },
  });

  const outDir = parseOutDir();
  if (outDir) {
    mkdirSync(outDir, { recursive: true });
    writeFileSync(resolve(outDir, "com.tesla.3p.public-key.pem"), publicKey);
    writeFileSync(resolve(outDir, "private-key.pem"), privateKey);
    console.log(`Keys written to ${outDir}/`);
    console.log("  com.tesla.3p.public-key.pem");
    console.log("  private-key.pem");
    console.log("");
  }

  console.log("Add to .env.local / Vercel (do not commit private key):");
  console.log("");
  console.log(`TESLA_FLEET_PUBLIC_KEY_PEM="${toEnvValue(publicKey)}"`);
  console.log(`TESLA_FLEET_PRIVATE_KEY_PEM="${toEnvValue(privateKey)}"`);
  console.log("");
  console.log(
    "Public key URL (after deploy with TESLA_FLEET_PUBLIC_KEY_PEM set):",
  );
  console.log(
    "  https://your-domain/.well-known/appspecific/com.tesla.3p.public-key.pem",
  );
  console.log("");
  console.log("Then run: npm run register:tesla-partner");
}

main();
