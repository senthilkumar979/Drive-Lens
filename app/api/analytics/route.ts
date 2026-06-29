import { requireSessionUserId } from "@/lib/auth/session";
import {
  getAnalyticsRollups,
  getVehiclesByUserId,
} from "@/lib/db/repositories";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const { searchParams } = new URL(request.url);
    const period = (searchParams.get("period") ?? "weekly") as
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly";

    const vehicles = await getVehiclesByUserId(userId);
    if (!vehicles.length) return apiSuccess({ rollups: [] });

    const vehicleId = String(vehicles[0]._id);
    const rollups = await getAnalyticsRollups(vehicleId, period);
    return apiSuccess({ rollups, period });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
