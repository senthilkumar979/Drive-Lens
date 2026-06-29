import { z } from "zod";
import { requireSessionUserId } from "@/lib/auth/session";
import { createMaintenance, getMaintenance, completeMaintenance } from "@/lib/db/repositories";
import { getVehiclesByUserId } from "@/lib/db/repositories";
import { apiError, apiSuccess } from "@/lib/api/response";

const schema = z.object({
  type: z.string(),
  dueAt: z.string(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const items = await getMaintenance(userId);
    return apiSuccess({ items });
  } catch {
    return apiError("Unauthorized", 401);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.message);

    const vehicles = await getVehiclesByUserId(userId);
    if (!vehicles.length) return apiError("No vehicle");

    const item = await createMaintenance({
      userId,
      vehicleId: String(vehicles[0]._id),
      type: parsed.data.type,
      dueAt: new Date(parsed.data.dueAt),
      notes: parsed.data.notes,
    });
    return apiSuccess({ item }, 201);
  } catch {
    return apiError("Unauthorized", 401);
  }
}

export async function PATCH(request: Request) {
  try {
    await requireSessionUserId();
    const { id } = await request.json();
    if (!id) return apiError("Missing id");
    await completeMaintenance(id);
    return apiSuccess({ ok: true });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
