import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { users } from "./users.ts";

/**
 * Database table definition for `password_reset_tokens`.
 *
 * Stores tokens for password reset flows with expiry and usage tracking.
 */
export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
});
