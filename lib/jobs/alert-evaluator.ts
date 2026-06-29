import { createNotification, findUserById } from "@/lib/db/repositories";
import type { VehicleSnapshotDocument } from "@/types/database";

export async function evaluateAlerts(
  userId: string,
  vehicleId: string,
  snapshot: VehicleSnapshotDocument,
): Promise<void> {
  const user = await findUserById(userId);
  if (!user) return;

  const prefs = user.preferences?.notifications;

  if (prefs?.batteryLow && snapshot.batteryLevel < 20) {
    await createNotification({
      userId,
      type: "battery_low",
      title: "Battery below 20%",
      body: `Your vehicle is at ${snapshot.batteryLevel}% charge.`,
    });
  }

  if (prefs?.chargingComplete && snapshot.chargingState === "Complete") {
    await createNotification({
      userId,
      type: "charging_complete",
      title: "Charging complete",
      body: `Battery at ${snapshot.batteryLevel}%. Ready to drive.`,
    });
  }

  if (prefs?.vehicleUnlocked && snapshot.locked === false) {
    await createNotification({
      userId,
      type: "vehicle_unlocked",
      title: "Vehicle unlocked",
      body: "Your vehicle is currently unlocked.",
    });
  }

  void vehicleId;
}
