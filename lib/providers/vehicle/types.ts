export interface VehicleLocation {
  latitude: number;
  longitude: number;
  heading?: number;
}

export interface VehicleClimate {
  insideTemp?: number;
  outsideTemp?: number;
  isClimateOn?: boolean;
}

export interface VehicleChargeState {
  batteryLevel: number;
  rangeKm: number;
  chargingState: "Charging" | "Complete" | "Disconnected" | "Unknown";
  chargeLimit?: number;
}

export interface VehicleSnapshot {
  vehicleId: string;
  timestamp: Date;
  batteryLevel: number;
  rangeKm: number;
  odometerKm?: number;
  locked?: boolean;
  climate?: VehicleClimate;
  location?: VehicleLocation;
  provider: string;
}

export interface Vehicle {
  id: string;
  provider: string;
  displayName: string;
  vin?: string;
  model?: string;
  color?: string;
}

export interface VehicleProvider {
  readonly id: string;
  readonly displayName: string;
  listVehicles(accessToken: string): Promise<Vehicle[]>;
  getVehicleSnapshot(
    accessToken: string,
    vehicleId: string,
  ): Promise<VehicleSnapshot>;
  sendNavigation(
    accessToken: string,
    vehicleId: string,
    latitude: number,
    longitude: number,
  ): Promise<void>;
}
