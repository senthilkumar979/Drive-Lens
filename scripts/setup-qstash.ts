#!/usr/bin/env tsx
/**
 * Register QStash schedules for DriveLens cron jobs.
 *
 * Requires:
 *   QSTASH_TOKEN
 *   QSTASH_CALLBACK_URL or AUTH_URL (public app URL)
 *
 * Usage: npm run setup:qstash
 */
import { setupQStashSchedules } from "../lib/qstash/setup-schedules";

async function main() {
  await setupQStashSchedules();
  console.log("QStash schedules configured.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
