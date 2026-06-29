import { refreshAiInsightsForUser } from "@/lib/jobs/ai-insights";
import { getAllUsers } from "@/lib/db/repositories";
import { apiError, apiSuccess, verifyDevCronSecret } from "@/lib/api/response";
import { withQStash } from "@/lib/qstash/with-qstash";

async function runAiInsightsJob() {
  const users = await getAllUsers();
  let generated = 0;

  for (const user of users) {
    generated += await refreshAiInsightsForUser(String(user._id));
  }

  return apiSuccess({
    ok: true,
    job: "ai-insights",
    insightsGenerated: generated,
    timestamp: new Date().toISOString(),
  });
}

export const POST = withQStash(async () => runAiInsightsJob());

export async function GET(request: Request) {
  if (process.env.NODE_ENV !== "development") {
    return apiError("Use QStash POST in production", 405);
  }
  if (!verifyDevCronSecret(request)) {
    return apiError("Unauthorized", 401);
  }
  return runAiInsightsJob();
}
