import { relations } from "drizzle-orm";
import { sessions } from "../tables/sessions.ts";
import { users } from "../tables/users.ts";

/**
 * Relations for the `sessions` table.
 *
 * Defines relationships from sessions to users (owner of the session).
 */
export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));
