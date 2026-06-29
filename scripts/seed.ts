#!/usr/bin/env tsx
/**
 * Seed MongoDB with indexes and optional demo user.
 * Usage: MONGODB_URI=... npx tsx scripts/seed.ts
 */
import { getDb } from "../lib/db/mongodb";
import { ensureIndexes } from "../lib/db/indexes";
import { COLLECTIONS } from "../lib/db/collections";

async function main() {
  if (process.env.DRIVELENS_MOCK_MODE === "true" || !process.env.MONGODB_URI) {
    console.log("Skipping MongoDB seed — mock mode or no MONGODB_URI");
    process.exit(0);
  }

  const db = await getDb();
  await ensureIndexes(db);

  await db.collection(COLLECTIONS.users).updateOne(
    { email: "demo@drivelens.app" },
    {
      $set: {
        name: "Demo Driver",
        preferences: {
          units: "metric",
          notifications: {
            batteryLow: true,
            chargingComplete: true,
            vehicleUnlocked: true,
          },
        },
        updatedAt: new Date(),
      },
      $setOnInsert: { createdAt: new Date() },
    },
    { upsert: true },
  );

  console.log("Seed complete — indexes created, demo user upserted");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
