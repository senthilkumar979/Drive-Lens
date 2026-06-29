import {
  createChargingSession,
  getActiveChargingSession,
  updateChargingSession,
} from "@/lib/db/repositories";
import type { VehicleSnapshotDocument } from "@/types/database";

export async function detectChargingTransition(
  userId: string,
  vehicleId: string,
  snapshot: VehicleSnapshotDocument,
): Promise<void> {
  const state = snapshot.chargingState ?? "Disconnected";
  const active = await getActiveChargingSession(vehicleId);

  if (state === "Charging" && !active) {
    await createChargingSession({
      vehicleId,
      userId,
      startedAt: snapshot.timestamp,
      source: "detected",
      isActive: true,
      location:
        snapshot.latitude && snapshot.longitude
          ? { lat: snapshot.latitude, lng: snapshot.longitude }
          : undefined,
    });
    return;
  }

  if (active && (state === "Complete" || state === "Disconnected")) {
    const energyKwh =
      snapshot.batteryLevel && active.energyKwh
        ? active.energyKwh
        : estimateEnergyKwh(snapshot.batteryLevel);

    await updateChargingSession(String(active._id), {
      isActive: false,
      endedAt: snapshot.timestamp,
      energyKwh,
      costUsd: energyKwh * 0.35,
    });
  }
}

function estimateEnergyKwh(batteryLevel?: number): number {
  if (!batteryLevel) return 0;
  return Math.round(batteryLevel * 0.75 * 10) / 10;
}
