import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Postgres enum for `pot_type`.
 *
 * Pot types such as 'solo' (single owner) and 'shared' (multiple owners).
 */
export const potType = pgEnum("pot_type", ["solo", "shared"]);
