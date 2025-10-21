import { bigint, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { pots } from "./pots.ts";
import { transactions } from "./transactions.ts";
import { users } from "./users.ts";

/**
 * Database table definition for `reservations`.
 *
 * Tracks reserved amounts against pots or other entities before finalisation.
 */
export const reservations = pgTable("reservations", {
  id: uuid("id").primaryKey().defaultRandom(),
  potId: uuid("pot_id")
    .references(() => pots.id)
    .notNull(),
  transactionId: uuid("transaction_id")
    .references(() => transactions.id)
    .notNull(),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
  createdById: uuid("created_by_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
