import { requireSessionUserId } from "@/lib/auth/session";
import {
  getLatestAiInsight,
  getVehiclesByUserId,
} from "@/lib/db/repositories";
import { generateInsight } from "@/services/gemini/client";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const vehicles = await getVehiclesByUserId(userId);
    if (!vehicles.length) return apiSuccess({ insight: null });

    const vehicleId = String(vehicles[0]._id);
    const insight = await getLatestAiInsight(userId, vehicleId);
    return apiSuccess({ insight });
  } catch {
    return apiError("Unauthorized", 401);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const { message } = await request.json();
    if (!message) return apiError("Message required");

    const response = await generateInsight(
      `You are DriveLens EV assistant. User asks: ${message}. Answer concisely.`,
    );
    void userId;
    return apiSuccess({ response });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
