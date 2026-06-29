import { generateWeeklyInsight } from "@/services/gemini/client";
import {
  getAnalyticsRollups,
  getLatestAiInsight,
  getVehiclesByUserId,
  saveAiInsight,
} from "@/lib/db/repositories";

export async function refreshAiInsightsForUser(userId: string): Promise<number> {
  const vehicles = await getVehiclesByUserId(userId);
  let generated = 0;

  for (const vehicle of vehicles) {
    const vehicleId = String(vehicle._id);
    const rollups = await getAnalyticsRollups(vehicleId, "weekly");
    const weekly = rollups[0];
    if (!weekly) continue;

    const existing = await getLatestAiInsight(userId, vehicleId);
    if (
      existing &&
      existing.generatedAt.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
    ) {
      continue;
    }

    const insight = await generateWeeklyInsight({
      distanceKm: weekly.metrics.distanceKm,
      energyKwh: weekly.metrics.energyKwh,
      tripCount: weekly.metrics.tripCount,
      avgEfficiency: weekly.metrics.avgEfficiencyWhPerKm,
      chargingCost: weekly.metrics.chargingCostUsd,
    });

    await saveAiInsight({
      userId,
      vehicleId,
      period: "weekly",
      generatedAt: new Date(),
      summary: insight.summary,
      recommendations: insight.recommendations,
    });
    generated += 1;
  }

  return generated;
}
