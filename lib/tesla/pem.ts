import { createPublicKey } from "node:crypto";

/** Normalize PEM stored in env (supports literal `\n` sequences). */
export function normalizePem(pem: string): string {
  const trimmed = pem.trim();
  if (trimmed.includes("\\n")) {
    return trimmed.replace(/\\n/g, "\n");
  }
  return trimmed;
}

export function isValidEcPublicKeyPem(pem: string): boolean {
  const normalized = normalizePem(pem);
  return (
    normalized.includes("BEGIN PUBLIC KEY") &&
    normalized.includes("END PUBLIC KEY")
  );
}

/** Detects when the env var was set to the public URL instead of PEM contents. */
export function looksLikePublicKeyUrl(value: string): boolean {
  const trimmed = value.trim();
  return /^https?:\/\//i.test(trimmed) && trimmed.includes(".pem");
}

/** Tesla returns EC public keys as uncompressed point hex (04 + x + y). */
export function pemToUncompressedHex(pem: string): string {
  const key = createPublicKey(normalizePem(pem));
  const jwk = key.export({ format: "jwk" }) as { x: string; y: string };
  const x = Buffer.from(jwk.x, "base64url");
  const y = Buffer.from(jwk.y, "base64url");
  return `04${x.toString("hex")}${y.toString("hex")}`;
}

export function publicKeysMatch(pem: string, registeredHex: string): boolean {
  const localHex = pemToUncompressedHex(pem).toLowerCase();
  const remoteHex = registeredHex.trim().toLowerCase();
  return localHex === remoteHex;
}
