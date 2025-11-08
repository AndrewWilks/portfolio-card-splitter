import { bigint, index, pgTable, uuid } from "drizzle-orm/pg-core";

import { allocations } from "./allocations.ts";
import { members } from "./members.ts";
import { pots } from "./pots.ts";
import { transactions } from "./transactions.ts";
import { users } from "./users.ts";
import { entity } from "./base/entity.ts";

/**
 * Database table definition for `reservations`.
 *
 * Tracks reserved amounts against pots or other entities before finalisation.
 * Links to allocations and members to track which member's allocation is being reserved.
 */
export const reservations = pgTable(
  "reservations",
  {
    ...entity,
    potId: uuid("pot_id")
      .references(() => pots.id)
      .notNull(),
    transactionId: uuid("transaction_id")
      .references(() => transactions.id)
      .notNull(),
    allocationId: uuid("allocation_id").references(() => allocations.id, {
      onDelete: "cascade",
    }),
    memberId: uuid("member_id")
      .references(() => members.id, { onDelete: "restrict" })
      .notNull(),
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
    createdById: uuid("created_by_id")
      .references(() => users.id)
      .notNull(),
  },
  (table) => ({
    allocationIdx: index("idx_reservations_allocation_id").on(
      table.allocationId
    ),
    memberIdx: index("idx_reservations_member_id").on(table.memberId),
  })
);
