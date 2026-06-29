import { requireSessionUserId } from "@/lib/auth/session";
import { getVehiclesByUserId } from "@/lib/db/repositories";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const vehicles = await getVehiclesByUserId(userId);
    return apiSuccess({ vehicles });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
