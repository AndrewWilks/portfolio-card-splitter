import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import * as schema from "./db.schema.ts";
import { config } from "../config.ts";

/**
 * Initialises and exports a configured database client instance using Drizzle ORM.
 *
 * This client is set up with a PostgreSQL connection pool and a predefined schema,
 * allowing for type-safe database operations throughout the application.
 *
 * @remarks
 * - The connection pool is created using the provided `DB_URL`.
 * - The schema defines the structure and types of the database tables.
 *
 * @see {@link https://orm.drizzle.team/docs/overview Drizzle ORM Documentation}
 */

export const DB_POOL = new Pool({
  connectionString: config.DATABASE_URL,
});

export const db = drizzle(DB_POOL, { schema });
