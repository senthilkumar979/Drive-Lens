import { subDays } from "date-fns";
import { requireSessionUserId } from "@/lib/auth/session";
import { getSnapshots, getVehiclesByUserId } from "@/lib/db/repositories";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const { searchParams } = new URL(request.url);
    const days = Number(searchParams.get("days") ?? 7);
    const vehicles = await getVehiclesByUserId(userId);
    if (!vehicles.length) return apiSuccess({ snapshots: [] });

    const vehicleId = String(vehicles[0]._id);
    const since = subDays(new Date(), days);
    const snapshots = await getSnapshots(vehicleId, since);
    return apiSuccess({ snapshots });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
