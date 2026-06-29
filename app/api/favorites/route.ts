import { z } from "zod";
import { requireSessionUserId } from "@/lib/auth/session";
import {
  createFavorite,
  deleteFavorite,
  getFavorites,
} from "@/lib/db/repositories";
import { apiError, apiSuccess } from "@/lib/api/response";

const favoriteSchema = z.object({
  name: z.string().min(1),
  latitude: z.number(),
  longitude: z.number(),
  icon: z.string().default("map-pin"),
  sortOrder: z.number().default(0),
});

export async function GET() {
  try {
    const userId = await requireSessionUserId();
    const favorites = await getFavorites(userId);
    return apiSuccess({ favorites });
  } catch {
    return apiError("Unauthorized", 401);
  }
}

export async function POST(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const body = await request.json();
    const parsed = favoriteSchema.safeParse(body);
    if (!parsed.success) return apiError(parsed.error.message);

    const favorite = await createFavorite({ ...parsed.data, userId });
    return apiSuccess({ favorite }, 201);
  } catch {
    return apiError("Unauthorized", 401);
  }
}

export async function DELETE(request: Request) {
  try {
    const userId = await requireSessionUserId();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return apiError("Missing id");
    await deleteFavorite(userId, id);
    return apiSuccess({ ok: true });
  } catch {
    return apiError("Unauthorized", 401);
  }
}
