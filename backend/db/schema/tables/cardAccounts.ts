import { bigint, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { users } from "./users.ts";
import { entity } from "./base/entity.ts";

/**
 * Database table definition for `card_accounts`.
 *
 * Represents credit card accounts with billing details and credit limits.
 * Each CardAccount belongs to a User and has one-to-one CardAccountSettings.
 */
export const cardAccounts = pgTable("card_accounts", {
  ...entity,
  name: text("name").notNull(),
  issuer: text("issuer").notNull(),
  last4: text("last4").notNull(),
  billingCycle: integer("billing_cycle").notNull(),
  creditLimitCents: bigint("credit_limit_cents", { mode: "number" }),
  ownerId: uuid("owner_id")
    .references(() => users.id, { onDelete: "restrict" })
    .notNull(),
});
