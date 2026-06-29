import type { Db } from "mongodb";
import { COLLECTIONS } from "./collections";

export async function ensureIndexes(db: Db): Promise<void> {
  await db.collection(COLLECTIONS.users).createIndex({ email: 1 }, { unique: true });
  await db
    .collection(COLLECTIONS.vehicles)
    .createIndex({ userId: 1, provider: 1, externalId: 1 }, { unique: true });
  await db
    .collection(COLLECTIONS.vehicleSnapshots)
    .createIndex({ vehicleId: 1, timestamp: -1 });
  await db.collection(COLLECTIONS.trips).createIndex({ userId: 1, startTime: -1 });
  await db
    .collection(COLLECTIONS.tripLocations)
    .createIndex({ tripId: 1, timestamp: 1 });
  await db
    .collection(COLLECTIONS.chargingSessions)
    .createIndex({ userId: 1, startedAt: -1 });
  await db.collection(COLLECTIONS.favorites).createIndex({ userId: 1 });
  await db
    .collection(COLLECTIONS.analyticsRollups)
    .createIndex(
      { vehicleId: 1, period: 1, periodStart: 1 },
      { unique: true },
    );
  await db
    .collection(COLLECTIONS.notifications)
    .createIndex({ userId: 1, createdAt: -1 });
}
