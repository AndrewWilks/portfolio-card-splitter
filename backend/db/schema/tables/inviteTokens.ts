import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { userRole } from "../enums/userRole.ts";

/**
 * Database table definition for `invite_tokens`.
 *
 * Stores one-time invite tokens issued to emails with a role and expiry.
 */
export const inviteTokens = pgTable("invite_tokens", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull(),
  role: userRole("role").notNull().default("user"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  usedAt: timestamp("used_at", { withTimezone: true }),
});
