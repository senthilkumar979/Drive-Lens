import { subDays, subHours } from "date-fns";
import { generateId, getMemoryStore } from "@/lib/db/memory-store";
import type {
  AnalyticsRollupDocument,
  ChargingSessionDocument,
  FavoriteDocument,
  TripDocument,
  UserDocument,
  VehicleDocument,
  VehicleSnapshotDocument,
} from "@/types/database";

const DEMO_USER_ID = "demo-user";
const DEMO_VEHICLE_ID = "demo-vehicle";

export function seedDemoData(): void {
  const store = getMemoryStore();
  if (store.users.some((u) => u._id === DEMO_USER_ID)) return;

  const now = new Date();
  const user: UserDocument = {
    _id: DEMO_USER_ID,
    email: "demo@drivelens.app",
    name: "Demo Driver",
    preferences: {
      units: "metric",
      notifications: {
        batteryLow: true,
        chargingComplete: true,
        vehicleUnlocked: true,
      },
    },
    createdAt: now,
    updatedAt: now,
  };

  const vehicle: VehicleDocument = {
    _id: DEMO_VEHICLE_ID,
    userId: DEMO_USER_ID,
    provider: "tesla",
    externalId: "demo-tesla-1",
    displayName: "Model 3",
    model: "Model 3",
    color: "Midnight Silver",
    vin: "DEMO123456789",
  };

  const snapshots: VehicleSnapshotDocument[] = [];
  for (let i = 48; i >= 0; i--) {
    const t = subHours(now, i * 2);
    const battery = 45 + Math.sin(i / 8) * 25 + (48 - i) * 0.3;
    snapshots.push({
      vehicleId: DEMO_VEHICLE_ID,
      userId: DEMO_USER_ID,
      timestamp: t,
      batteryLevel: Math.round(Math.min(95, Math.max(20, battery))),
      rangeKm: Math.round(battery * 5.2),
      odometerKm: 28841 + (48 - i) * 2,
      locked: true,
      chargingState: i < 3 ? "Charging" : "Disconnected",
      insideTempC: 22 + Math.sin(i / 6),
      outsideTempC: 14 + Math.cos(i / 5),
      latitude: 37.7749 + Math.sin(i / 10) * 0.02,
      longitude: -122.4194 + Math.cos(i / 10) * 0.02,
      speedKmh: i % 5 === 0 ? 0 : 45,
    });
  }

  const trips: TripDocument[] = [
    {
      _id: generateId(),
      vehicleId: DEMO_VEHICLE_ID,
      userId: DEMO_USER_ID,
      startTime: subDays(now, 1),
      endTime: subHours(subDays(now, 1), -2),
      distanceKm: 41.2,
      consumptionKwh: 8.4,
      avgSpeedKmh: 62,
      startLocation: { lat: 37.7749, lng: -122.4194 },
      endLocation: { lat: 37.8044, lng: -122.2712 },
    },
    {
      _id: generateId(),
      vehicleId: DEMO_VEHICLE_ID,
      userId: DEMO_USER_ID,
      startTime: subDays(now, 3),
      endTime: subHours(subDays(now, 3), -1.5),
      distanceKm: 28.5,
      consumptionKwh: 5.1,
      avgSpeedKmh: 55,
      startLocation: { lat: 37.7749, lng: -122.4194 },
      endLocation: { lat: 37.6879, lng: -122.4702 },
    },
    {
      _id: generateId(),
      vehicleId: DEMO_VEHICLE_ID,
      userId: DEMO_USER_ID,
      startTime: subDays(now, 5),
      endTime: subHours(subDays(now, 5), -3),
      distanceKm: 95.8,
      consumptionKwh: 18.2,
      avgSpeedKmh: 78,
      startLocation: { lat: 37.7749, lng: -122.4194 },
      endLocation: { lat: 36.7783, lng: -119.4179 },
    },
  ];

  const charging: ChargingSessionDocument[] = [
    {
      _id: generateId(),
      vehicleId: DEMO_VEHICLE_ID,
      userId: DEMO_USER_ID,
      startedAt: subDays(now, 2),
      endedAt: subHours(subDays(now, 2), -4),
      energyKwh: 32,
      costUsd: 11.2,
      source: "detected",
      location: { lat: 37.7749, lng: -122.4194, name: "Home" },
    },
    {
      _id: generateId(),
      vehicleId: DEMO_VEHICLE_ID,
      userId: DEMO_USER_ID,
      startedAt: subDays(now, 6),
      endedAt: subHours(subDays(now, 6), -2),
      energyKwh: 28.5,
      costUsd: 14.8,
      source: "detected",
      location: { lat: 37.3382, lng: -121.8863, name: "Supercharger" },
    },
  ];

  const favorites: FavoriteDocument[] = [
    {
      _id: generateId(),
      userId: DEMO_USER_ID,
      name: "Home",
      latitude: 37.7749,
      longitude: -122.4194,
      icon: "home",
      sortOrder: 0,
    },
    {
      _id: generateId(),
      userId: DEMO_USER_ID,
      name: "Office",
      latitude: 37.7899,
      longitude: -122.3969,
      icon: "briefcase",
      sortOrder: 1,
    },
    {
      _id: generateId(),
      userId: DEMO_USER_ID,
      name: "Gym",
      latitude: 37.7699,
      longitude: -122.4469,
      icon: "dumbbell",
      sortOrder: 2,
    },
    {
      _id: generateId(),
      userId: DEMO_USER_ID,
      name: "Airport",
      latitude: 37.6213,
      longitude: -122.379,
      icon: "plane",
      sortOrder: 3,
    },
  ];

  const rollups: AnalyticsRollupDocument[] = [
    {
      vehicleId: DEMO_VEHICLE_ID,
      userId: DEMO_USER_ID,
      period: "weekly",
      periodStart: subDays(now, 7),
      metrics: {
        distanceKm: 312,
        energyKwh: 58.4,
        chargingCostUsd: 42.5,
        avgEfficiencyWhPerKm: 187,
        tripCount: 12,
        co2SavedKg: 18.2,
      },
    },
    {
      vehicleId: DEMO_VEHICLE_ID,
      userId: DEMO_USER_ID,
      period: "monthly",
      periodStart: subDays(now, 30),
      metrics: {
        distanceKm: 1240,
        energyKwh: 232,
        chargingCostUsd: 168,
        avgEfficiencyWhPerKm: 192,
        tripCount: 48,
        co2SavedKg: 72.5,
      },
    },
  ];

  store.users.push(user);
  store.vehicles.push(vehicle);
  store.vehicleSnapshots.push(...snapshots);
  store.trips.push(...trips);
  store.chargingSessions.push(...charging);
  store.favorites.push(...favorites);
  store.analyticsRollups.push(...rollups);

  store.aiInsights.push({
    _id: generateId(),
    userId: DEMO_USER_ID,
    vehicleId: DEMO_VEHICLE_ID,
    period: "weekly",
    generatedAt: subDays(now, 1),
    summary:
      "Your efficiency improved 8% this week. Most trips were under 40 km with strong regeneration on downhill segments.",
    recommendations: [
      "Charge during off-peak hours (11 PM – 6 AM) to save ~15% on energy costs.",
      "Precondition while plugged in before morning commutes.",
      "Highway trips above 110 km/h increased consumption — consider cruise control at 100 km/h.",
    ],
  });
}

export const DEMO_IDS = {
  userId: DEMO_USER_ID,
  vehicleId: DEMO_VEHICLE_ID,
};
