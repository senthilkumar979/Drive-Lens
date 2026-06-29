import { requireSessionUserId } from "@/lib/auth/session";
import { syncUserVehicles } from "@/lib/jobs/sync-vehicles";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId();
    let wake = true;
    try {
      const body = await request.json();
      wake = body?.wake !== false;
    } catch {
      wake = true;
    }
    const result = await syncUserVehicles(userId, { wake });
    return apiSuccess(result);
  } catch {
    return apiError("Unauthorized", 401);
  }
}
