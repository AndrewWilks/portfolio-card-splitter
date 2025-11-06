import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { pots } from "./pots.ts";
import { users } from "./users.ts";

/**
 * Database table definition for `transfers`.
 *
 * Records transfers of funds between pots or accounts.
 * Supports cash transactions via nullable pot IDs (at least one must be non-null).
 */
export const transfers = pgTable(
  "transfers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    fromPotId: uuid("from_pot_id").references(() => pots.id),
    toPotId: uuid("to_pot_id").references(() => pots.id),
    amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
    description: text("description"),
    createdById: uuid("created_by_id")
      .references(() => users.id)
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    atLeastOnePot: check(
      "transfers_at_least_one_pot",
      sql`${table.fromPotId} IS NOT NULL OR ${table.toPotId} IS NOT NULL`
    ),
  })
);
