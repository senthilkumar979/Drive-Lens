import { syncAllUsers } from "@/lib/jobs/sync-vehicles";
import { apiError, apiSuccess, verifyDevCronSecret } from "@/lib/api/response";
import { withQStash } from "@/lib/qstash/with-qstash";

async function runSyncVehicleJob() {
  const result = await syncAllUsers();
  return apiSuccess({
    ok: true,
    job: "sync-vehicle",
    ...result,
    timestamp: new Date().toISOString(),
  });
}

export const POST = withQStash(async () => runSyncVehicleJob());

/** Manual trigger in local development only */
export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return apiError("Use QStash POST in production", 405);
  }
  if (!verifyDevCronSecret(request)) {
    return apiError("Unauthorized", 401);
  }
  return runSyncVehicleJob();
}
