import { subDays, startOfDay, startOfMonth, startOfWeek, startOfYear } from "date-fns";
import {
  getChargingSessions,
  getTripsByUserId,
  upsertAnalyticsRollup,
} from "@/lib/db/repositories";
import type { AnalyticsRollupDocument } from "@/types/database";

export async function aggregateAnalyticsForVehicle(
  userId: string,
  vehicleId: string,
): Promise<void> {
  const now = new Date();
  const trips = await getTripsByUserId(userId, 500);
  const vehicleTrips = trips.filter((t) => t.vehicleId === vehicleId && t.endTime);
  const charging = await getChargingSessions(userId, 500);
  const vehicleCharging = charging.filter((c) => c.vehicleId === vehicleId && c.endedAt);

  const periods: Array<{
    period: AnalyticsRollupDocument["period"];
    start: Date;
  }> = [
    { period: "daily", start: startOfDay(now) },
    { period: "weekly", start: startOfWeek(now, { weekStartsOn: 1 }) },
    { period: "monthly", start: startOfMonth(now) },
    { period: "yearly", start: startOfYear(now) },
  ];

  for (const { period, start } of periods) {
    const periodTrips = vehicleTrips.filter((t) => t.startTime >= start);
    const periodCharging = vehicleCharging.filter((c) => c.startedAt >= start);

    const distanceKm = periodTrips.reduce((sum, t) => sum + t.distanceKm, 0);
    const energyKwh = periodTrips.reduce((sum, t) => sum + (t.consumptionKwh ?? 0), 0);
    const chargingCostUsd = periodCharging.reduce(
      (sum, c) => sum + (c.costUsd ?? 0),
      0,
    );
    const avgEfficiencyWhPerKm =
      distanceKm > 0 ? Math.round((energyKwh * 1000) / distanceKm) : 0;
    const co2SavedKg = energyKwh * 0.31;

    await upsertAnalyticsRollup({
      vehicleId,
      userId,
      period,
      periodStart: start,
      metrics: {
        distanceKm: Math.round(distanceKm * 10) / 10,
        energyKwh: Math.round(energyKwh * 10) / 10,
        chargingCostUsd: Math.round(chargingCostUsd * 100) / 100,
        avgEfficiencyWhPerKm,
        tripCount: periodTrips.length,
        co2SavedKg: Math.round(co2SavedKg * 10) / 10,
      },
    });
  }
}

export async function aggregateAllVehicles(
  userId: string,
  vehicleIds: string[],
): Promise<void> {
  for (const vehicleId of vehicleIds) {
    await aggregateAnalyticsForVehicle(userId, vehicleId);
  }
}

export async function cleanupOldSnapshots(): Promise<void> {
  // MongoDB TTL or manual cleanup — stub for cron
  const cutoff = subDays(new Date(), 730);
  void cutoff;
}
