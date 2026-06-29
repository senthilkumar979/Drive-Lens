import { requireSessionUserId } from "@/lib/auth/session";
import {
  getLatestSnapshot,
  getVehiclesByUserId,
} from "@/lib/db/repositories";
import { apiError, apiSuccess } from "@/lib/api/response";

function toId(value: unknown): string {
  return typeof value === "string" ? value : String(value);
}

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const vehicles = await getVehiclesByUserId(userId);
    if (!vehicles.length) {
      return apiSuccess({ vehicle: null, snapshot: null });
    }
    const vehicle = vehicles[0];
    const vehicleId = toId(vehicle._id);
    const snapshot = await getLatestSnapshot(vehicleId);
    return apiSuccess({ vehicle, snapshot });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
