import { bigint, pgTable, uuid } from "drizzle-orm/pg-core";

import { allocationRule } from "../enums/allocationRule.ts";

import { members } from "./members.ts";
import { transactions } from "./transactions.ts";
import { entity } from "./base/entity.ts";

/**
 * Database table definition for `allocations`.
 *
 * Represents allocation rules or records tying amounts to members.
 * Calculated amounts are derived in the entity layer, not persisted.
 */
export const allocations = pgTable("allocations", {
  ...entity,
  transactionId: uuid("transaction_id")
    .references(() => transactions.id)
    .notNull(),
  memberId: uuid("member_id")
    .references(() => members.id)
    .notNull(),
  rule: allocationRule("rule").notNull(),
  basisPoints: bigint("basis_points", { mode: "number" }), // stored as basis points (e.g., 2500 = 25%)
  amountCents: bigint("amount_cents", { mode: "number" }), // for fixed amounts
});
