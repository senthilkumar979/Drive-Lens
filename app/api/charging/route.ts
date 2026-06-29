import { requireSessionUserId } from "@/lib/auth/session";
import { getChargingSessions } from "@/lib/db/repositories";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const sessions = await getChargingSessions(userId);
    return apiSuccess({ sessions });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
