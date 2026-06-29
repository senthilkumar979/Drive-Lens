import type { ObjectId } from "mongodb";

export interface TeslaAccount {
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  vehicleIds?: string[];
}

export interface UserPreferences {
  units: "metric" | "imperial";
  notifications: {
    batteryLow: boolean;
    chargingComplete: boolean;
    vehicleUnlocked: boolean;
  };
}

export interface UserDocument {
  _id: ObjectId | string;
  email: string;
  name: string;
  image?: string;
  teslaAccount?: TeslaAccount;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface VehicleDocument {
  _id: ObjectId | string;
  userId: string;
  provider: string;
  externalId: string;
  displayName: string;
  vin?: string;
  model?: string;
  color?: string;
}

export interface VehicleSnapshotDocument {
  _id?: ObjectId | string;
  vehicleId: string;
  userId: string;
  timestamp: Date;
  batteryLevel: number;
  rangeKm: number;
  odometerKm?: number;
  locked?: boolean;
  chargingState?: string;
  insideTempC?: number;
  outsideTempC?: number;
  latitude?: number;
  longitude?: number;
  heading?: number;
  speedKmh?: number;
}

export interface TripDocument {
  _id: ObjectId | string;
  vehicleId: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  distanceKm: number;
  consumptionKwh?: number;
  avgSpeedKmh?: number;
  startLocation?: { lat: number; lng: number };
  endLocation?: { lat: number; lng: number };
  isActive?: boolean;
}

export interface TripLocationDocument {
  _id?: ObjectId | string;
  tripId: string;
  timestamp: Date;
  latitude: number;
  longitude: number;
  speedKmh?: number;
}

export interface ChargingSessionDocument {
  _id: ObjectId | string;
  vehicleId: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  location?: { lat: number; lng: number; name?: string };
  energyKwh?: number;
  costUsd?: number;
  source: "detected" | "manual";
  isActive?: boolean;
}

export interface FavoriteDocument {
  _id: ObjectId | string;
  userId: string;
  name: string;
  latitude: number;
  longitude: number;
  icon: string;
  sortOrder: number;
}

export interface MaintenanceDocument {
  _id: ObjectId | string;
  vehicleId: string;
  userId: string;
  type: string;
  dueAt: Date;
  completedAt?: Date;
  notes?: string;
}

export interface NotificationDocument {
  _id: ObjectId | string;
  userId: string;
  type: string;
  title: string;
  body: string;
  readAt?: Date;
  createdAt: Date;
}

export interface AiInsightDocument {
  _id: ObjectId | string;
  userId: string;
  vehicleId: string;
  period: string;
  generatedAt: Date;
  summary: string;
  recommendations: string[];
}

export interface AnalyticsRollupDocument {
  _id?: ObjectId | string;
  vehicleId: string;
  userId: string;
  period: "daily" | "weekly" | "monthly" | "yearly";
  periodStart: Date;
  metrics: {
    distanceKm: number;
    energyKwh: number;
    chargingCostUsd: number;
    avgEfficiencyWhPerKm: number;
    tripCount: number;
    co2SavedKg?: number;
  };
}
