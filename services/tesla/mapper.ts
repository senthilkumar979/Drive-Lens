import type { Vehicle, VehicleSnapshot } from "@/lib/providers/vehicle/types";
import type { TeslaVehicleDataResponse } from "./types";

export function mapTeslaVehicle(
  vehicle: {
    id: number;
    vehicle_id: number;
    vin: string;
    display_name: string;
  },
): Vehicle {
  return {
    id: vehicle.vin,
    provider: "tesla",
    displayName: vehicle.display_name || "Tesla",
    vin: vehicle.vin,
    model: "Tesla",
  };
}

function rangeKmFromCharge(
  charge: TeslaVehicleDataResponse["response"]["charge_state"],
): number {
  const miles =
    charge?.est_battery_range ??
    charge?.ideal_battery_range ??
    charge?.rated_battery_range ??
    0;
  return Math.round(miles * 1.60934);
}

export function mapTeslaSnapshot(
  vehicleId: string,
  data: TeslaVehicleDataResponse["response"],
): Omit<VehicleSnapshot, "provider"> {
  const charge = data.charge_state;
  const drive = data.drive_state;
  const vehicle = data.vehicle_state;
  const climate = data.climate_state;

  return {
    vehicleId,
    timestamp: new Date(),
    batteryLevel: charge?.battery_level ?? 0,
    rangeKm: rangeKmFromCharge(charge),
    odometerKm: vehicle?.odometer ? vehicle.odometer * 1.60934 : undefined,
    locked: vehicle?.locked,
    climate: climate
      ? {
          insideTemp: climate.inside_temp,
          outsideTemp: climate.outside_temp,
          isClimateOn: climate.is_climate_on,
        }
      : undefined,
    location: drive
      ? {
          latitude: drive.latitude,
          longitude: drive.longitude,
          heading: drive.heading,
        }
      : undefined,
  };
}

export function mapTeslaSnapshotToDocument(
  userId: string,
  vehicleId: string,
  data: TeslaVehicleDataResponse["response"],
) {
  const snap = mapTeslaSnapshot(vehicleId, data);
  const drive = data.drive_state;
  const charge = data.charge_state;
  const climate = data.climate_state;

  return {
    vehicleId,
    userId,
    timestamp: snap.timestamp,
    batteryLevel: snap.batteryLevel,
    rangeKm: snap.rangeKm,
    odometerKm: snap.odometerKm,
    locked: snap.locked,
    chargingState: charge?.charging_state,
    insideTempC: climate?.inside_temp,
    outsideTempC: climate?.outside_temp,
    latitude: drive?.latitude,
    longitude: drive?.longitude,
    heading: drive?.heading,
    speedKmh: drive?.speed ? drive.speed * 1.60934 : undefined,
  };
}
