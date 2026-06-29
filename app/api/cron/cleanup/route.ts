import { cleanupOldSnapshots } from "@/lib/jobs/analytics-aggregator";
import { apiError, apiSuccess, verifyDevCronSecret } from "@/lib/api/response";
import { withQStash } from "@/lib/qstash/with-qstash";

async function runCleanupJob() {
  await cleanupOldSnapshots();

  return apiSuccess({
    ok: true,
    job: "cleanup",
    timestamp: new Date().toISOString(),
  });
}

export const POST = withQStash(async () => runCleanupJob());

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return apiError("Use QStash POST in production", 405);
  }
  if (!verifyDevCronSecret(request)) {
    return apiError("Unauthorized", 401);
  }
  return runCleanupJob();
}
