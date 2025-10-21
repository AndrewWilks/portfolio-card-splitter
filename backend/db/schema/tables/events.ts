import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { eventType } from "../enums/eventType.ts";

import { users } from "./users.ts";

/**
 * Database table definition for `events`.
 *
 * Used to record system events/audit logs.
 * Columns include type, entity reference, actor, payload and timestamp.
 */
export const events = pgTable("events", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: eventType("type").notNull(),
  entityId: uuid("entity_id").notNull(),
  entityType: text("entity_type").notNull(),
  actorId: uuid("actor_id").references(() => users.id),
  ipHash: text("ip_hash"),
  payload: text("payload"), // JSON string
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
