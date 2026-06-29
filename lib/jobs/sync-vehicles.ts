import { decryptToken, encryptToken } from "@/lib/crypto/encryption";
import {
  findUserById,
  getAllUsers,
  insertSnapshot,
  upsertVehicle,
} from "@/lib/db/repositories";
import { isMockMode } from "@/lib/env";
import { getDefaultVehicleProvider } from "@/lib/providers/vehicle";
import { refreshTeslaToken } from "@/services/tesla/client";
import { getTeslaVehicleData } from "@/services/tesla/api";
import { mapTeslaSnapshotToDocument } from "@/services/tesla/mapper";
import { evaluateAlerts } from "./alert-evaluator";
import "@/lib/providers/vehicle/index";
import { detectChargingTransition } from "./charging-detector";
import { detectTripActivity } from "./trip-detector";

function toUserId(id: unknown): string {
  return typeof id === "string" ? id : String(id);
}

async function getAccessToken(userId: string): Promise<string | null> {
  const user = await findUserById(userId);
  if (!user?.teslaAccount?.accessToken) {
    if (isMockMode()) return "mock-token";
    return null;
  }

  let accessToken = decryptToken(user.teslaAccount.accessToken);
  const expiresAt = user.teslaAccount.expiresAt;

  if (
    expiresAt &&
    expiresAt.getTime() < Date.now() + 60_000 &&
    user.teslaAccount.refreshToken
  ) {
    const refresh = decryptToken(user.teslaAccount.refreshToken);
    const tokens = await refreshTeslaToken(refresh);
    accessToken = tokens.access_token;
    // Token persistence would update user in DB — simplified here
    encryptToken(tokens.access_token);
  }

  return accessToken;
}

export async function syncUserVehicles(userId: string): Promise<{
  snapshots: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let snapshots = 0;
  const provider = getDefaultVehicleProvider();
  if (!provider) {
    return { snapshots: 0, errors: ["No vehicle provider registered"] };
  }

  const accessToken = await getAccessToken(userId);
  if (!accessToken) {
    return { snapshots: 0, errors: ["No access token"] };
  }

  try {
    const vehicles = await provider.listVehicles(accessToken);
    for (const vehicle of vehicles) {
      const stored = await upsertVehicle({
        userId,
        provider: vehicle.provider,
        externalId: vehicle.id,
        displayName: vehicle.displayName,
        vin: vehicle.vin,
        model: vehicle.model,
        color: vehicle.color,
      });

      const vehicleId = toUserId(stored._id);
      let snapshotDoc;

      if (isMockMode()) {
        const snap = await provider.getVehicleSnapshot(accessToken, vehicle.id);
        snapshotDoc = {
          vehicleId,
          userId,
          timestamp: snap.timestamp,
          batteryLevel: snap.batteryLevel,
          rangeKm: snap.rangeKm,
          odometerKm: snap.odometerKm,
          locked: snap.locked,
          chargingState: "Disconnected",
          insideTempC: snap.climate?.insideTemp,
          outsideTempC: snap.climate?.outsideTemp,
          latitude: snap.location?.latitude,
          longitude: snap.location?.longitude,
          heading: snap.location?.heading,
        };
      } else {
        const data = await getTeslaVehicleData(accessToken, vehicle.id);
        snapshotDoc = mapTeslaSnapshotToDocument(userId, vehicleId, data);
      }

      await insertSnapshot(snapshotDoc);
      snapshots += 1;

      await detectTripActivity(userId, vehicleId, snapshotDoc);
      await detectChargingTransition(userId, vehicleId, snapshotDoc);
      await evaluateAlerts(userId, vehicleId, snapshotDoc);
    }
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Sync failed");
  }

  return { snapshots, errors };
}

export async function syncAllUsers(): Promise<{
  usersProcessed: number;
  snapshotsInserted: number;
  errors: string[];
}> {
  const users = await getAllUsers();
  let snapshotsInserted = 0;
  const errors: string[] = [];

  for (const user of users) {
    const userId = toUserId(user._id);
    const result = await syncUserVehicles(userId);
    snapshotsInserted += result.snapshots;
    errors.push(...result.errors);
  }

  return {
    usersProcessed: users.length,
    snapshotsInserted,
    errors,
  };
}
