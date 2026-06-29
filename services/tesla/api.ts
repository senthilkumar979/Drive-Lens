import { teslaFetch } from "./client";
import type {
  TeslaVehicleDataResponse,
  TeslaVehicleResponse,
} from "./types";

export async function listTeslaVehicles(accessToken: string) {
  const data = await teslaFetch<TeslaVehicleResponse>(
    "/api/1/vehicles",
    accessToken,
  );
  return data.response;
}

export async function getTeslaVehicleData(
  accessToken: string,
  vehicleId: string,
) {
  const data = await teslaFetch<TeslaVehicleDataResponse>(
    `/api/1/vehicles/${vehicleId}/vehicle_data`,
    accessToken,
  );
  return data.response;
}

export async function wakeTeslaVehicle(accessToken: string, vehicleId: string) {
  return teslaFetch(`/api/1/vehicles/${vehicleId}/wake_up`, accessToken, {
    method: "POST",
  });
}

export async function sendTeslaNavigation(
  accessToken: string,
  vehicleId: string,
  latitude: number,
  longitude: number,
) {
  return teslaFetch(
    `/api/1/vehicles/${vehicleId}/command/navigation_request`,
    accessToken,
    {
      method: "POST",
      body: JSON.stringify({
        lat: latitude,
        lon: longitude,
      }),
    },
  );
}
