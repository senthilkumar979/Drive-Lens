import { requireSessionUserId } from "@/lib/auth/session";
import { getTripById } from "@/lib/db/repositories";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    await requireSessionUserId();
    const { id } = await context.params;
    const trip = await getTripById(id);
    if (!trip) return apiError("Trip not found", 404);
    return apiSuccess({ trip });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
