import { NextResponse } from "next/server";
import { getTeslaFleetPublicKeyPem } from "@/lib/env";
import {
  isValidEcPublicKeyPem,
  looksLikePublicKeyUrl,
  normalizePem,
} from "@/lib/tesla/pem";

export async function GET() {
  const pem = getTeslaFleetPublicKeyPem();
  if (!pem) {
    return new NextResponse(
      "Tesla Fleet public key is not configured. Set TESLA_FLEET_PUBLIC_KEY_PEM to the PEM text (run npm run generate:tesla-keys), not a URL.",
      { status: 404 },
    );
  }

  if (looksLikePublicKeyUrl(pem)) {
    return new NextResponse(
      "TESLA_FLEET_PUBLIC_KEY_PEM must be the PEM key contents (-----BEGIN PUBLIC KEY----- ...), not the public URL where it is hosted.",
      { status: 500 },
    );
  }

  if (!isValidEcPublicKeyPem(pem)) {
    return new NextResponse(
      "TESLA_FLEET_PUBLIC_KEY_PEM is invalid. Expected an EC public key PEM from npm run generate:tesla-keys.",
      { status: 500 },
    );
  }

  return new NextResponse(normalizePem(pem), {
    status: 200,
    headers: {
      "Content-Type": "application/x-pem-file",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
