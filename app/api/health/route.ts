import { NextResponse } from "next/server";
import {
  getAuthUrl,
  hasTeslaCredentials,
  isMockMode,
} from "@/lib/env";
import { isDatabaseConnected } from "@/lib/db/mongodb";

export async function GET() {
  const connected = await isDatabaseConnected();
  return NextResponse.json({
    status: "ok",
    service: "drivelens",
    timestamp: new Date().toISOString(),
    auth: {
      url: getAuthUrl(),
      teslaOAuth: hasTeslaCredentials(),
      mockMode: isMockMode(),
      databaseConnected: connected,
    },
  });
}
