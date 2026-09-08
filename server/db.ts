import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Standard node-postgres driver: works against any PostgreSQL host (Neon,
// local, RDS, etc.) over the regular wire protocol, so the app isn't tied to
// a specific provider's proxy/serverless connection scheme.
const isLocalDb = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocalDb ? false : true,
});
export const db = drizzle(pool, { schema });
