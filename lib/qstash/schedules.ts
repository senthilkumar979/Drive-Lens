export const QSTASH_SCHEDULES = [
  {
    id: "sync-vehicle",
    path: "/api/cron/sync-vehicle",
    cron: "*/5 * * * *",
    label: "Sync vehicle snapshots",
  },
  {
    id: "aggregate-analytics",
    path: "/api/cron/aggregate-analytics",
    cron: "5 0 * * *",
    label: "Aggregate analytics rollups",
  },
  {
    id: "ai-insights",
    path: "/api/cron/ai-insights",
    cron: "0 6 * * 1",
    label: "Generate weekly AI insights",
  },
  {
    id: "cleanup",
    path: "/api/cron/cleanup",
    cron: "0 3 1 * *",
    label: "Cleanup old snapshots",
  },
] as const;

export function getAppBaseUrl(): string {
  const url =
    process.env.QSTASH_CALLBACK_URL ??
    process.env.AUTH_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

  if (!url) {
    throw new Error(
      "Set QSTASH_CALLBACK_URL or AUTH_URL (e.g. https://your-app.vercel.app)",
    );
  }

  return url.replace(/\/$/, "");
}
