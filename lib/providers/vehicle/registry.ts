import type { VehicleProvider } from "./types";

const providers = new Map<string, VehicleProvider>();

export function registerVehicleProvider(provider: VehicleProvider): void {
  providers.set(provider.id, provider);
}

export function getVehicleProvider(id: string): VehicleProvider | undefined {
  return providers.get(id);
}

export function getDefaultVehicleProvider(): VehicleProvider | undefined {
  return providers.get("tesla");
}
