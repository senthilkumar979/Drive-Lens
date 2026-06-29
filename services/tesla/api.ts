import { teslaFetch } from "./client";
import type {
  TeslaVehicleDataResponse,
  TeslaVehicleResponse,
} from "./types";

const VEHICLE_DATA_ENDPOINTS =
  "charge_state;climate_state;drive_state;vehicle_state;location_data;gui_settings;vehicle_config";

export async function listTeslaVehicles(accessToken: string) {
  const data = await teslaFetch<TeslaVehicleResponse>(
    "/api/1/vehicles",
    accessToken,
  );
  return data.response;
}

export async function getTeslaVehicleData(
  accessToken: string,
  vehicleTag: string,
) {
  const params = new URLSearchParams({ endpoints: VEHICLE_DATA_ENDPOINTS });
  const data = await teslaFetch<TeslaVehicleDataResponse>(
    `/api/1/vehicles/${encodeURIComponent(vehicleTag)}/vehicle_data?${params}`,
    accessToken,
  );
  return data.response;
}

export async function wakeTeslaVehicle(accessToken: string, vehicleTag: string) {
  return teslaFetch(
    `/api/1/vehicles/${encodeURIComponent(vehicleTag)}/wake_up`,
    accessToken,
    { method: "POST" },
  );
}

export async function sendTeslaNavigation(
  accessToken: string,
  vehicleTag: string,
  latitude: number,
  longitude: number,
) {
  return teslaFetch(
    `/api/1/vehicles/${encodeURIComponent(vehicleTag)}/command/navigation_request`,
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
