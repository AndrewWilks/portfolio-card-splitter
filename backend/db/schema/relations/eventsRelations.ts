import { relations } from "drizzle-orm";
import { events } from "../tables/events.ts";
import { users } from "../tables/users.ts";

export const eventsRelations = relations(events, ({ one }) => ({
  actor: one(users, {
    fields: [events.actorId],
    references: [users.id],
  }),
}));
