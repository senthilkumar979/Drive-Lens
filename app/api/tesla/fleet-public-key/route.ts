import { NextResponse } from "next/server";
import { getTeslaFleetPublicKeyPem } from "@/lib/env";
import { isValidEcPublicKeyPem, normalizePem } from "@/lib/tesla/pem";

export async function GET() {
  const pem = getTeslaFleetPublicKeyPem();
  if (!pem || !isValidEcPublicKeyPem(pem)) {
    return new NextResponse("Tesla Fleet public key is not configured", {
      status: 404,
    });
  }

  return new NextResponse(normalizePem(pem), {
    status: 200,
    headers: {
      "Content-Type": "application/x-pem-file",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
