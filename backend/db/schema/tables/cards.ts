import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { cardAccounts } from "./cardAccounts.ts";
import { members } from "./members.ts";
import { entity } from "./base/entity.ts";

/**
 * Database table definition for `cards`.
 *
 * Represents individual cards within a CardAccount.
 * Optional entity for attributing transactions to specific cardholders (Members).
 */
export const cards = pgTable("cards", {
  ...entity,
  cardAccountId: uuid("card_account_id")
    .references(() => cardAccounts.id, { onDelete: "cascade" })
    .notNull(),
  memberId: uuid("member_id").references(() => members.id, {
    onDelete: "set null",
  }),
  nickname: text("nickname"),
  last4: text("last4"),
});
