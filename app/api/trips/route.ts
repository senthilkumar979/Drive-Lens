import { requireSessionUserId } from "@/lib/auth/session";
import { getTripsByUserId } from "@/lib/db/repositories";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const trips = await getTripsByUserId(userId);
    return apiSuccess({ trips });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
