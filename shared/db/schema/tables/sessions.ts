import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users.ts";

/**
 * Database table definition for `sessions`.
 *
 * Stores authentication/session tokens for users.
 */
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id)
    .notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
