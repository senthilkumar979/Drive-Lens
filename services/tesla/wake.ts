import { teslaFetch } from "./client";
import type { TeslaVehicleDetailResponse } from "./types";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getTeslaVehicleState(
  accessToken: string,
  vehicleTag: string,
): Promise<string | undefined> {
  const data = await teslaFetch<TeslaVehicleDetailResponse>(
    `/api/1/vehicles/${encodeURIComponent(vehicleTag)}`,
    accessToken,
  );
  return data.response?.state;
}

/** Wake an asleep vehicle and wait until online (Fleet API live data requires this). */
export async function ensureTeslaVehicleOnline(
  accessToken: string,
  vehicleTag: string,
): Promise<void> {
  const state = await getTeslaVehicleState(accessToken, vehicleTag);
  if (state === "online") return;

  await teslaFetch(
    `/api/1/vehicles/${encodeURIComponent(vehicleTag)}/wake_up`,
    accessToken,
    { method: "POST" },
  );

  for (let attempt = 0; attempt < 15; attempt += 1) {
    await sleep(4000);
    const nextState = await getTeslaVehicleState(accessToken, vehicleTag);
    if (nextState === "online") return;
  }

  throw new Error(
    "Vehicle did not come online — try Sync again while the car has connectivity.",
  );
}
