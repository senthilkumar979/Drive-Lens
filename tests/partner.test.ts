import { afterEach, describe, expect, it } from "vitest";
import { normalizePem, isValidEcPublicKeyPem } from "@/lib/tesla/pem";

const SAMPLE_PUBLIC_KEY =
  "-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE\n-----END PUBLIC KEY-----";

describe("normalizePem", () => {
  it("expands escaped newlines from env vars", () => {
    const escaped =
      "-----BEGIN PUBLIC KEY-----\\nMFkw\\n-----END PUBLIC KEY-----";
    expect(normalizePem(escaped)).toBe(
      "-----BEGIN PUBLIC KEY-----\nMFkw\n-----END PUBLIC KEY-----",
    );
  });
});

describe("isValidEcPublicKeyPem", () => {
  it("accepts PEM with BEGIN/END PUBLIC KEY markers", () => {
    expect(isValidEcPublicKeyPem(SAMPLE_PUBLIC_KEY)).toBe(true);
  });

  it("rejects invalid content", () => {
    expect(isValidEcPublicKeyPem("not-a-key")).toBe(false);
  });
});

describe("getTeslaPartnerDomain", () => {
  afterEach(() => {
    delete process.env.AUTH_URL;
    delete process.env.TESLA_PARTNER_DOMAIN;
    delete process.env.TESLA_REDIRECT_URI;
    delete process.env.QSTASH_CALLBACK_URL;
  });

  it("parses hostname from AUTH_URL", async () => {
    process.env.AUTH_URL = "https://drive-lens-one.vercel.app";
    const { getTeslaPartnerDomain } = await import("@/lib/env");
    expect(getTeslaPartnerDomain()).toBe("drive-lens-one.vercel.app");
  });

  it("prefers TESLA_PARTNER_DOMAIN override", async () => {
    process.env.AUTH_URL = "https://drive-lens-one.vercel.app";
    process.env.TESLA_PARTNER_DOMAIN = "custom.example.com";
    const { getTeslaPartnerDomain } = await import("@/lib/env");
    expect(getTeslaPartnerDomain()).toBe("custom.example.com");
  });

  it("falls back to TESLA_REDIRECT_URI origin", async () => {
    process.env.TESLA_REDIRECT_URI =
      "https://drive-lens-one.vercel.app/api/auth/callback/tesla";
    const { getTeslaPartnerDomain } = await import("@/lib/env");
    expect(getTeslaPartnerDomain()).toBe("drive-lens-one.vercel.app");
  });
});
