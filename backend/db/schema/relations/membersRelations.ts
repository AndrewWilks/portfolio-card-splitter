import { relations } from "drizzle-orm";
import { members } from "../tables/members.ts";
import { users } from "../tables/users.ts";
import { allocations } from "../tables/allocations.ts";

/**
 * Relations for the `members` table.
 *
 * Defines relationships from members to their parent user and allocations.
 */
export const membersRelations = relations(members, ({ one, many }) => ({
  user: one(users, {
    fields: [members.userId],
    references: [users.id],
  }),
  allocations: many(allocations),
}));
