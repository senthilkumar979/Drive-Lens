import { requireSessionUserId } from "@/lib/auth/session";
import { getNotifications } from "@/lib/db/repositories";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const notifications = await getNotifications(userId);
    return apiSuccess({ notifications });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
