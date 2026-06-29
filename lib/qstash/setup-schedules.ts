import { getQStashClient } from "./client";
import { getAppBaseUrl, QSTASH_SCHEDULES } from "./schedules";

export async function setupQStashSchedules(): Promise<void> {
  const client = getQStashClient();
  const baseUrl = getAppBaseUrl();
  const existing = await client.schedules.list();

  for (const schedule of QSTASH_SCHEDULES) {
    const destination = `${baseUrl}${schedule.path}`;
    const match = existing.find((s) => s.destination === destination);

    if (match) {
      await client.schedules.delete(match.scheduleId);
    }

    await client.schedules.create({
      destination,
      cron: schedule.cron,
      body: JSON.stringify({ job: schedule.id }),
      headers: { "Content-Type": "application/json" },
    });

    console.log(`✓ ${schedule.label}: ${schedule.cron} → ${destination}`);
  }
}
