import { pgTable, uuid, bigint, text, timestamp } from "drizzle-orm/pg-core";

import { pots } from "./pots.ts";
import { users } from "./users.ts";

/**
 * Database table definition for `transfers`.
 *
 * Records transfers of funds between pots or accounts.
 */
export const transfers = pgTable("transfers", {
  id: uuid("id").primaryKey().defaultRandom(),
  fromPotId: uuid("from_pot_id")
    .references(() => pots.id)
    .notNull(),
  toPotId: uuid("to_pot_id")
    .references(() => pots.id)
    .notNull(),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
  description: text("description"),
  createdById: uuid("created_by_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
