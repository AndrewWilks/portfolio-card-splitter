import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { users } from "./users.ts";

/**
 * Database table definition for `members`.
 *
 * Represents members tied to a user account (e.g., household or group members).
 */
export const members = pgTable("members", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  displayName: text("display_name").notNull(),
  archived: boolean("archived").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
