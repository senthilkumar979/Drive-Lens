import { isMockMode } from "@/lib/env";
import type { Vehicle, VehicleProvider, VehicleSnapshot } from "@/lib/providers/vehicle/types";
import {
  getTeslaVehicleData,
  listTeslaVehicles,
  sendTeslaNavigation,
} from "@/services/tesla/api";
import { mapTeslaSnapshot, mapTeslaVehicle } from "@/services/tesla/mapper";

function mockSnapshot(vehicleId: string): VehicleSnapshot {
  const battery = 65 + Math.random() * 20;
  return {
    vehicleId,
    timestamp: new Date(),
    batteryLevel: Math.round(battery),
    rangeKm: Math.round(battery * 5.2),
    odometerKm: 28841 + Math.random() * 10,
    locked: true,
    provider: "tesla",
    climate: { insideTemp: 22, outsideTemp: 16, isClimateOn: false },
    location: {
      latitude: 37.7749 + Math.random() * 0.01,
      longitude: -122.4194 + Math.random() * 0.01,
      heading: 180,
    },
  };
}

export const teslaVehicleProvider: VehicleProvider = {
  id: "tesla",
  displayName: "Tesla",

  async listVehicles(accessToken: string): Promise<Vehicle[]> {
    if (isMockMode()) {
      return [
        {
          id: "demo-tesla-1",
          provider: "tesla",
          displayName: "Model 3",
          model: "Model 3",
          vin: "DEMO123456789",
        },
      ];
    }
    const vehicles = await listTeslaVehicles(accessToken);
    return vehicles.map(mapTeslaVehicle);
  },

  async getVehicleSnapshot(
    accessToken: string,
    vehicleId: string,
  ): Promise<VehicleSnapshot> {
    if (isMockMode()) {
      return mockSnapshot(vehicleId);
    }
    const data = await getTeslaVehicleData(accessToken, vehicleId);
    const snap = mapTeslaSnapshot(vehicleId, data);
    return { ...snap, provider: "tesla" };
  },

  async sendNavigation(
    accessToken: string,
    vehicleId: string,
    latitude: number,
    longitude: number,
  ): Promise<void> {
    if (isMockMode()) return;
    await sendTeslaNavigation(accessToken, vehicleId, latitude, longitude);
  },
};
