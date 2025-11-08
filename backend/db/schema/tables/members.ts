import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { users } from "./users.ts";
import { entity } from "./base/entity.ts";

/**
 * Database table definition for `members`.
 *
 * Represents members tied to a user account (e.g., household or group members).
 */
export const members = pgTable("members", {
  ...entity,
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "cascade" })
    .notNull(),
  displayName: text("display_name").notNull(),
});
