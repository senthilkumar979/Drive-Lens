import { ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/db/collections";
import { generateId, getMemoryStore } from "@/lib/db/memory-store";
import { getDb } from "@/lib/db/mongodb";
import { seedDemoData } from "@/lib/mock/seed";
import { isMockMode } from "@/lib/env";
import type {
  AiInsightDocument,
  AnalyticsRollupDocument,
  ChargingSessionDocument,
  FavoriteDocument,
  MaintenanceDocument,
  NotificationDocument,
  TripDocument,
  UserDocument,
  VehicleDocument,
  VehicleSnapshotDocument,
} from "@/types/database";

function toId(value: ObjectId | string): string {
  return typeof value === "string" ? value : value.toString();
}

export async function findUserByEmail(email: string): Promise<UserDocument | null> {
  if (isMockMode()) {
    seedDemoData();
    return getMemoryStore().users.find((u) => u.email === email) ?? null;
  }
  const db = await getDb();
  return (await db.collection(COLLECTIONS.users).findOne({ email })) as UserDocument | null;
}

export async function findUserById(id: string): Promise<UserDocument | null> {
  if (isMockMode()) {
    seedDemoData();
    return getMemoryStore().users.find((u) => toId(u._id) === id) ?? null;
  }
  const db = await getDb();
  const user = await db.collection(COLLECTIONS.users).findOne({
    _id: new ObjectId(id),
  });
  return user as UserDocument | null;
}

export async function upsertUser(user: Omit<UserDocument, "_id" | "createdAt" | "updatedAt"> & {
  _id?: string;
}): Promise<UserDocument> {
  const now = new Date();
  if (isMockMode()) {
    seedDemoData();
    const store = getMemoryStore();
    const existing = store.users.find((u) => u.email === user.email);
    if (existing) {
      Object.assign(existing, user, { updatedAt: now });
      return existing;
    }
    const doc: UserDocument = {
      ...user,
      _id: user._id ?? generateId(),
      createdAt: now,
      updatedAt: now,
      preferences: user.preferences ?? {
        units: "metric",
        notifications: { batteryLow: true, chargingComplete: true, vehicleUnlocked: true },
      },
    };
    store.users.push(doc);
    return doc;
  }
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.users).findOneAndUpdate(
    { email: user.email },
    {
      $set: { ...user, updatedAt: now },
      $setOnInsert: { createdAt: now },
    },
    { upsert: true, returnDocument: "after" },
  );
  return result as UserDocument;
}

export async function getVehiclesByUserId(userId: string): Promise<VehicleDocument[]> {
  if (isMockMode()) {
    seedDemoData();
    return getMemoryStore().vehicles.filter((v) => v.userId === userId);
  }
  const db = await getDb();
  return (await db
    .collection(COLLECTIONS.vehicles)
    .find({ userId })
    .toArray()) as VehicleDocument[];
}

export async function upsertVehicle(
  vehicle: Omit<VehicleDocument, "_id"> & { _id?: string },
): Promise<VehicleDocument> {
  if (isMockMode()) {
    const store = getMemoryStore();
    const existing = store.vehicles.find(
      (v) =>
        v.userId === vehicle.userId &&
        v.provider === vehicle.provider &&
        v.externalId === vehicle.externalId,
    );
    if (existing) {
      Object.assign(existing, vehicle);
      return existing;
    }
    const doc: VehicleDocument = { ...vehicle, _id: vehicle._id ?? generateId() };
    store.vehicles.push(doc);
    return doc;
  }
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.vehicles).findOneAndUpdate(
    {
      userId: vehicle.userId,
      provider: vehicle.provider,
      $or: [{ externalId: vehicle.externalId }, { vin: vehicle.vin }],
    },
    { $set: vehicle },
    { upsert: true, returnDocument: "after" },
  );
  return result as VehicleDocument;
}

export async function insertSnapshot(
  snapshot: Omit<VehicleSnapshotDocument, "_id">,
): Promise<void> {
  if (isMockMode()) {
    getMemoryStore().vehicleSnapshots.push(snapshot);
    return;
  }
  const db = await getDb();
  await db.collection(COLLECTIONS.vehicleSnapshots).insertOne(snapshot);
}

export async function getLatestSnapshot(
  vehicleId: string,
): Promise<VehicleSnapshotDocument | null> {
  if (isMockMode()) {
    seedDemoData();
    const snaps = getMemoryStore().vehicleSnapshots
      .filter((s) => s.vehicleId === vehicleId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    return snaps[0] ?? null;
  }
  const db = await getDb();
  const snap = await db
    .collection(COLLECTIONS.vehicleSnapshots)
    .findOne({ vehicleId }, { sort: { timestamp: -1 } });
  return snap as VehicleSnapshotDocument | null;
}

export async function getSnapshots(
  vehicleId: string,
  since: Date,
): Promise<VehicleSnapshotDocument[]> {
  if (isMockMode()) {
    seedDemoData();
    return getMemoryStore().vehicleSnapshots
      .filter((s) => s.vehicleId === vehicleId && s.timestamp >= since)
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  const db = await getDb();
  return (await db
    .collection(COLLECTIONS.vehicleSnapshots)
    .find({ vehicleId, timestamp: { $gte: since } })
    .sort({ timestamp: 1 })
    .toArray()) as VehicleSnapshotDocument[];
}

export async function getTripsByUserId(
  userId: string,
  limit = 50,
): Promise<TripDocument[]> {
  if (isMockMode()) {
    seedDemoData();
    return getMemoryStore()
      .trips.filter((t) => t.userId === userId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .slice(0, limit);
  }
  const db = await getDb();
  return (await db
    .collection(COLLECTIONS.trips)
    .find({ userId })
    .sort({ startTime: -1 })
    .limit(limit)
    .toArray()) as TripDocument[];
}

export async function getTripById(tripId: string): Promise<TripDocument | null> {
  if (isMockMode()) {
    seedDemoData();
    return getMemoryStore().trips.find((t) => toId(t._id) === tripId) ?? null;
  }
  const db = await getDb();
  return (await db
    .collection(COLLECTIONS.trips)
    .findOne({ _id: new ObjectId(tripId) })) as TripDocument | null;
}

export async function getActiveTrip(vehicleId: string): Promise<TripDocument | null> {
  if (isMockMode()) {
    return getMemoryStore().trips.find((t) => t.vehicleId === vehicleId && t.isActive) ?? null;
  }
  const db = await getDb();
  return (await db
    .collection(COLLECTIONS.trips)
    .findOne({ vehicleId, isActive: true })) as TripDocument | null;
}

export async function createTrip(trip: Omit<TripDocument, "_id">): Promise<TripDocument> {
  if (isMockMode()) {
    const doc: TripDocument = { ...trip, _id: generateId() };
    getMemoryStore().trips.push(doc);
    return doc;
  }
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.trips).insertOne(trip);
  return { ...trip, _id: result.insertedId };
}

export async function updateTrip(
  tripId: string,
  updates: Partial<TripDocument>,
): Promise<void> {
  if (isMockMode()) {
    const trip = getMemoryStore().trips.find((t) => toId(t._id) === tripId);
    if (trip) Object.assign(trip, updates);
    return;
  }
  const db = await getDb();
  await db
    .collection(COLLECTIONS.trips)
    .updateOne({ _id: new ObjectId(tripId) }, { $set: updates });
}

export async function getChargingSessions(
  userId: string,
  limit = 50,
): Promise<ChargingSessionDocument[]> {
  if (isMockMode()) {
    seedDemoData();
    return getMemoryStore()
      .chargingSessions.filter((c) => c.userId === userId)
      .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())
      .slice(0, limit);
  }
  const db = await getDb();
  return (await db
    .collection(COLLECTIONS.chargingSessions)
    .find({ userId })
    .sort({ startedAt: -1 })
    .limit(limit)
    .toArray()) as ChargingSessionDocument[];
}

export async function getActiveChargingSession(
  vehicleId: string,
): Promise<ChargingSessionDocument | null> {
  if (isMockMode()) {
    return (
      getMemoryStore().chargingSessions.find(
        (c) => c.vehicleId === vehicleId && c.isActive,
      ) ?? null
    );
  }
  const db = await getDb();
  return (await db
    .collection(COLLECTIONS.chargingSessions)
    .findOne({ vehicleId, isActive: true })) as ChargingSessionDocument | null;
}

export async function createChargingSession(
  session: Omit<ChargingSessionDocument, "_id">,
): Promise<ChargingSessionDocument> {
  if (isMockMode()) {
    const doc: ChargingSessionDocument = { ...session, _id: generateId() };
    getMemoryStore().chargingSessions.push(doc);
    return doc;
  }
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.chargingSessions).insertOne(session);
  return { ...session, _id: result.insertedId };
}

export async function updateChargingSession(
  id: string,
  updates: Partial<ChargingSessionDocument>,
): Promise<void> {
  if (isMockMode()) {
    const session = getMemoryStore().chargingSessions.find((c) => toId(c._id) === id);
    if (session) Object.assign(session, updates);
    return;
  }
  const db = await getDb();
  await db
    .collection(COLLECTIONS.chargingSessions)
    .updateOne({ _id: new ObjectId(id) }, { $set: updates });
}

export async function getFavorites(userId: string): Promise<FavoriteDocument[]> {
  if (isMockMode()) {
    seedDemoData();
    return getMemoryStore()
      .favorites.filter((f) => f.userId === userId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }
  const db = await getDb();
  return (await db
    .collection(COLLECTIONS.favorites)
    .find({ userId })
    .sort({ sortOrder: 1 })
    .toArray()) as FavoriteDocument[];
}

export async function createFavorite(
  favorite: Omit<FavoriteDocument, "_id">,
): Promise<FavoriteDocument> {
  if (isMockMode()) {
    const doc: FavoriteDocument = { ...favorite, _id: generateId() };
    getMemoryStore().favorites.push(doc);
    return doc;
  }
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.favorites).insertOne(favorite);
  return { ...favorite, _id: result.insertedId };
}

export async function deleteFavorite(userId: string, favoriteId: string): Promise<void> {
  if (isMockMode()) {
    const store = getMemoryStore();
    store.favorites = store.favorites.filter(
      (f) => toId(f._id) !== favoriteId || f.userId !== userId,
    );
    return;
  }
  const db = await getDb();
  await db.collection(COLLECTIONS.favorites).deleteOne({
    _id: new ObjectId(favoriteId),
    userId,
  });
}

export async function getAnalyticsRollups(
  vehicleId: string,
  period: AnalyticsRollupDocument["period"],
): Promise<AnalyticsRollupDocument[]> {
  if (isMockMode()) {
    seedDemoData();
    return getMemoryStore().analyticsRollups.filter(
      (r) => r.vehicleId === vehicleId && r.period === period,
    );
  }
  const db = await getDb();
  return (await db
    .collection(COLLECTIONS.analyticsRollups)
    .find({ vehicleId, period })
    .sort({ periodStart: -1 })
    .toArray()) as AnalyticsRollupDocument[];
}

export async function upsertAnalyticsRollup(
  rollup: Omit<AnalyticsRollupDocument, "_id">,
): Promise<void> {
  if (isMockMode()) {
    const store = getMemoryStore();
    const idx = store.analyticsRollups.findIndex(
      (r) =>
        r.vehicleId === rollup.vehicleId &&
        r.period === rollup.period &&
        r.periodStart.getTime() === rollup.periodStart.getTime(),
    );
    if (idx >= 0) store.analyticsRollups[idx] = { ...rollup, _id: store.analyticsRollups[idx]._id };
    else store.analyticsRollups.push({ ...rollup, _id: generateId() });
    return;
  }
  const db = await getDb();
  await db.collection(COLLECTIONS.analyticsRollups).updateOne(
    {
      vehicleId: rollup.vehicleId,
      period: rollup.period,
      periodStart: rollup.periodStart,
    },
    { $set: rollup },
    { upsert: true },
  );
}

export async function getNotifications(
  userId: string,
  limit = 20,
): Promise<NotificationDocument[]> {
  if (isMockMode()) {
    return getMemoryStore()
      .notifications.filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }
  const db = await getDb();
  return (await db
    .collection(COLLECTIONS.notifications)
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .toArray()) as NotificationDocument[];
}

export async function createNotification(
  notification: Omit<NotificationDocument, "_id" | "createdAt">,
): Promise<void> {
  const doc = { ...notification, createdAt: new Date() };
  if (isMockMode()) {
    getMemoryStore().notifications.push({ ...doc, _id: generateId() });
    return;
  }
  const db = await getDb();
  await db.collection(COLLECTIONS.notifications).insertOne(doc);
}

export async function getMaintenance(
  userId: string,
): Promise<MaintenanceDocument[]> {
  if (isMockMode()) {
    return getMemoryStore().maintenance.filter((m) => m.userId === userId);
  }
  const db = await getDb();
  return (await db
    .collection(COLLECTIONS.maintenance)
    .find({ userId })
    .sort({ dueAt: 1 })
    .toArray()) as MaintenanceDocument[];
}

export async function createMaintenance(
  item: Omit<MaintenanceDocument, "_id">,
): Promise<MaintenanceDocument> {
  if (isMockMode()) {
    const doc: MaintenanceDocument = { ...item, _id: generateId() };
    getMemoryStore().maintenance.push(doc);
    return doc;
  }
  const db = await getDb();
  const result = await db.collection(COLLECTIONS.maintenance).insertOne(item);
  return { ...item, _id: result.insertedId };
}

export async function completeMaintenance(id: string): Promise<void> {
  if (isMockMode()) {
    const item = getMemoryStore().maintenance.find((m) => toId(m._id) === id);
    if (item) item.completedAt = new Date();
    return;
  }
  const db = await getDb();
  await db
    .collection(COLLECTIONS.maintenance)
    .updateOne({ _id: new ObjectId(id) }, { $set: { completedAt: new Date() } });
}

export async function getLatestAiInsight(
  userId: string,
  vehicleId: string,
): Promise<AiInsightDocument | null> {
  if (isMockMode()) {
    seedDemoData();
    const insights = getMemoryStore().aiInsights
      .filter((i) => i.userId === userId && i.vehicleId === vehicleId)
      .sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
    return insights[0] ?? null;
  }
  const db = await getDb();
  return (await db
    .collection(COLLECTIONS.aiInsights)
    .findOne({ userId, vehicleId }, { sort: { generatedAt: -1 } })) as AiInsightDocument | null;
}

export async function saveAiInsight(
  insight: Omit<AiInsightDocument, "_id">,
): Promise<void> {
  if (isMockMode()) {
    getMemoryStore().aiInsights.push({ ...insight, _id: generateId() });
    return;
  }
  const db = await getDb();
  await db.collection(COLLECTIONS.aiInsights).insertOne(insight);
}

export async function getAllUsers(): Promise<UserDocument[]> {
  if (isMockMode()) {
    seedDemoData();
    return getMemoryStore().users;
  }
  const db = await getDb();
  return (await db.collection(COLLECTIONS.users).find().toArray()) as UserDocument[];
}
