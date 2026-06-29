import { config } from "dotenv";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

/** Load `.env` then `.env.local` (local overrides) for CLI scripts. */
export function loadEnvFiles(): void {
  const root = process.cwd();
  const envPath = resolve(root, ".env");
  const localPath = resolve(root, ".env.local");

  if (existsSync(envPath)) {
    config({ path: envPath });
  }
  if (existsSync(localPath)) {
    config({ path: localPath, override: true });
  }
}
