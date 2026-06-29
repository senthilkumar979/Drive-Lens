import { NextResponse } from "next/server";
import { getAuthUrl, hasTeslaCredentials, isMockMode } from "@/lib/env";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "drivelens",
    timestamp: new Date().toISOString(),
    auth: {
      url: getAuthUrl(),
      teslaOAuth: hasTeslaCredentials(),
      mockMode: isMockMode(),
    },
  });
}
