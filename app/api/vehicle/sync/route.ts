import { requireSessionUserId } from "@/lib/auth/session";
import { syncUserVehicles } from "@/lib/jobs/sync-vehicles";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function POST() {
  try {
    const userId = await requireSessionUserId();
    const result = await syncUserVehicles(userId);
    return apiSuccess(result);
  } catch {
    return apiError("Unauthorized", 401);
  }
}
