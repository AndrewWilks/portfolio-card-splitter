import { bigint, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { transactionType } from "../enums/transactionType.ts";

import { merchants } from "./merchants.ts";
import { users } from "./users.ts";

/**
 * Database table definition for `transactions`.
 *
 * Stores financial transactions created by users or system processes.
 */
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  merchantId: uuid("merchant_id")
    .references(() => merchants.id)
    .notNull(),
  description: text("description").notNull(),
  amountCents: bigint("amount_cents", { mode: "number" }).notNull(),
  type: transactionType("type").notNull().default("expense"),
  transactionDate: timestamp("transaction_date", {
    withTimezone: true,
  }).notNull(),
  createdById: uuid("created_by_id")
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
