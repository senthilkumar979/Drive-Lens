import type {
  AiInsightDocument,
  AnalyticsRollupDocument,
  ChargingSessionDocument,
  FavoriteDocument,
  MaintenanceDocument,
  NotificationDocument,
  TripDocument,
  TripLocationDocument,
  UserDocument,
  VehicleDocument,
  VehicleSnapshotDocument,
} from "@/types/database";

export interface MemoryStore {
  users: UserDocument[];
  vehicles: VehicleDocument[];
  vehicleSnapshots: VehicleSnapshotDocument[];
  trips: TripDocument[];
  tripLocations: TripLocationDocument[];
  chargingSessions: ChargingSessionDocument[];
  favorites: FavoriteDocument[];
  maintenance: MaintenanceDocument[];
  notifications: NotificationDocument[];
  aiInsights: AiInsightDocument[];
  analyticsRollups: AnalyticsRollupDocument[];
}

const globalStore = globalThis as unknown as {
  drivelensMemoryStore?: MemoryStore;
};

export function getMemoryStore(): MemoryStore {
  if (!globalStore.drivelensMemoryStore) {
    globalStore.drivelensMemoryStore = {
      users: [],
      vehicles: [],
      vehicleSnapshots: [],
      trips: [],
      tripLocations: [],
      chargingSessions: [],
      favorites: [],
      maintenance: [],
      notifications: [],
      aiInsights: [],
      analyticsRollups: [],
    };
  }
  return globalStore.drivelensMemoryStore;
}

export function generateId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 9)}`;
}
