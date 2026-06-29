import { aggregateAllVehicles } from "@/lib/jobs/analytics-aggregator";
import { getAllUsers, getVehiclesByUserId } from "@/lib/db/repositories";
import { apiError, apiSuccess, verifyDevCronSecret } from "@/lib/api/response";
import { withQStash } from "@/lib/qstash/with-qstash";

async function runAggregateAnalyticsJob() {
  const users = await getAllUsers();
  let processed = 0;

  for (const user of users) {
    const userId = String(user._id);
    const vehicles = await getVehiclesByUserId(userId);
    const ids = vehicles.map((v) => String(v._id));
    await aggregateAllVehicles(userId, ids);
    processed += 1;
  }

  return apiSuccess({
    ok: true,
    job: "aggregate-analytics",
    usersProcessed: processed,
    timestamp: new Date().toISOString(),
  });
}

export const POST = withQStash(async () => runAggregateAnalyticsJob());

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return apiError("Use QStash POST in production", 405);
  }
  if (!verifyDevCronSecret(request)) {
    return apiError("Unauthorized", 401);
  }
  return runAggregateAnalyticsJob();
}
