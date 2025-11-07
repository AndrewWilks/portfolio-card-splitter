import {
  bigint,
  boolean,
  date,
  pgTable,
  text,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

import { pots } from "./pots.ts";
import { reservations } from "./reservations.ts";
import { transactions } from "./transactions.ts";
import { users } from "./users.ts";
import { entity } from "./base/entity.ts";

/**
 * Database table definition for `payments`.
 *
 * Stores payment records from pots to transactions.
 * Each payment must come from a pot (potId is required).
 */
export const payments = pgTable("payments", {
  ...entity,
  transactionId: uuid("transaction_id")
    .references(() => transactions.id)
    .notNull(),
  potId: uuid("pot_id")
    .references(() => pots.id)
    .notNull(),
  reservationId: uuid("reservation_id").references(() => reservations.id),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
  paidOn: date("paid_on", { mode: "date" })
    .notNull()
    .default(sql`CURRENT_DATE`),
  note: text("note"),
  needsReconciliation: boolean("needs_reconciliation")
    .notNull()
    .default(false),
  createdById: uuid("created_by_id")
    .references(() => users.id)
    .notNull(),
});
