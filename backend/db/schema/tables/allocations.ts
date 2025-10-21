import { bigint, pgTable, timestamp, uuid } from "drizzle-orm/pg-core";

import { allocationRule } from "../enums/allocationRule.ts";

import { members } from "./members.ts";
import { transactions } from "./transactions.ts";

/**
 * Database table definition for `allocations`.
 *
 * Represents allocation rules or records tying amounts to pots or categories.
 */
export const allocations = pgTable("allocations", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id")
    .references(() => transactions.id)
    .notNull(),
  memberId: uuid("member_id")
    .references(() => members.id)
    .notNull(),
  rule: allocationRule("rule").notNull(),
  percentage: bigint("percentage", { mode: "number" }), // stored as basis points (e.g., 2500 = 25%)
  amountCents: bigint("amount_cents", { mode: "number" }), // for fixed amounts
  calculatedAmountCents: bigint("calculated_amount_cents", {
    mode: "number",
  }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
