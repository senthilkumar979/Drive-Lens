import { MongoClient, type Db } from "mongodb";
import { isMockMode } from "@/lib/env";
import { ensureIndexes } from "./indexes";

const globalForMongo = globalThis as unknown as {
  mongoClient: MongoClient | undefined;
  indexesReady: boolean | undefined;
};

function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not defined");
  }
  return uri;
}

export async function getMongoClient(): Promise<MongoClient> {
  if (!globalForMongo.mongoClient) {
    globalForMongo.mongoClient = new MongoClient(getMongoUri());
    await globalForMongo.mongoClient.connect();
  }
  return globalForMongo.mongoClient;
}

export async function getDb(): Promise<Db> {
  if (isMockMode()) {
    throw new Error("MongoDB unavailable in mock mode — use memory store");
  }
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB_NAME ?? "drivelens";
  const db = client.db(dbName);
  if (!globalForMongo.indexesReady) {
    await ensureIndexes(db);
    globalForMongo.indexesReady = true;
  }
  return db;
}

export async function isDatabaseConnected(): Promise<boolean> {
  if (isMockMode()) return false;
  try {
    const db = await getDb();
    await db.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
