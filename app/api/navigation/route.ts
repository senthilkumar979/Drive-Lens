import { z } from "zod";
import { requireSessionUserId } from "@/lib/auth/session";
import { getVehiclesByUserId } from "@/lib/db/repositories";
import { getDefaultVehicleProvider } from "@/lib/providers/vehicle";
import { decryptToken } from "@/lib/crypto/encryption";
import { findUserById } from "@/lib/db/repositories";
import { isMockMode } from "@/lib/env";
import { apiError, apiSuccess } from "@/lib/api/response";

const navSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const body = await request.json();
    const parsed = navSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.message);

    if (isMockMode()) {
      return apiSuccess({ ok: true, message: "Navigation sent (demo)" });
    }

    const provider = getDefaultVehicleProvider();
    if (!provider) return apiError("No provider");

    const user = await findUserById(userId);
    const vehicles = await getVehiclesByUserId(userId);
    if (!user?.teslaAccount?.accessToken || !vehicles.length) {
      return apiError("No vehicle connected");
    }

    const token = decryptToken(user.teslaAccount.accessToken);
    const vehicle = vehicles[0];
    await provider.sendNavigation(
      token,
      String(vehicle.externalId),
      parsed.data.latitude,
      parsed.data.longitude,
    );

    return apiSuccess({ ok: true });
  } catch (error) {
    return apiError(error instanceof Error ? error.message : "Failed", 500);
  }
}
