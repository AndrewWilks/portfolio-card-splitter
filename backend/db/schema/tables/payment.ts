import { bigint, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { pots } from "./pots.ts";
import { reservations } from "./reservations.ts";
import { transactions } from "./transactions.ts";
import { users } from "./users.ts";

/**
 * Database table definition for `payments`.
 *
 * Stores payment records associated with users, reservations, or transfers.
 */
export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id")
    .references(() => transactions.id)
    .notNull(),
  potId: uuid("pot_id").references(() => pots.id),
  reservationId: uuid("reservation_id").references(() => reservations.id),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
  description: text("description"),
  createdById: uuid("created_by_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
