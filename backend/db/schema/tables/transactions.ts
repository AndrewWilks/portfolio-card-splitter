import { bigint, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { transactionType } from "../enums/transactionType.ts";

import { cardAccounts } from "./cardAccounts.ts";
import { cards } from "./cards.ts";
import { merchants } from "./merchants.ts";
import { users } from "./users.ts";
import { entity } from "./base/entity.ts";

/**
 * Database table definition for `transactions`.
 *
 * Stores financial transactions created by users or system processes.
 * Each transaction belongs to a CardAccount and optionally references a Card.
 */
export const transactions = pgTable("transactions", {
  ...entity,
  cardAccountId: uuid("card_account_id")
    .references(() => cardAccounts.id, { onDelete: "restrict" })
    .notNull(),
  cardId: uuid("card_id").references(() => cards.id, { onDelete: "set null" }),
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
});
