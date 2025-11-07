import {
  bigint,
  boolean,
  integer,
  numeric,
  pgTable,
  uuid,
} from "drizzle-orm/pg-core";

import { cardAccounts } from "./cardAccounts.ts";
import { entity } from "./base/entity.ts";

/**
 * Database table definition for `card_account_settings`.
 *
 * One-to-one relationship with CardAccount.
 * Stores billing cycle configuration, payment terms, and notification preferences.
 * Defaults are configured for Australian credit cards (e.g., CommBank).
 */
export const cardAccountSettings = pgTable("card_account_settings", {
  ...entity,
  cardAccountId: uuid("card_account_id")
    .references(() => cardAccounts.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  statementCloseDayOfMonth: integer("statement_close_day_of_month")
    .notNull()
    .default(15),
  statementFrequencyDays: integer("statement_frequency_days")
    .notNull()
    .default(30),
  paymentDueDaysAfterClose: integer("payment_due_days_after_close")
    .notNull()
    .default(21),
  interestFreeDays: integer("interest_free_days").notNull().default(55),
  hasInterestFreePeriod: boolean("has_interest_free_period")
    .notNull()
    .default(true),
  minimumPaymentPercentage: numeric("minimum_payment_percentage", {
    precision: 5,
    scale: 2,
  })
    .notNull()
    .default("2.00"),
  minimumPaymentFloorCents: bigint("minimum_payment_floor_cents", {
    mode: "number",
  })
    .notNull()
    .default(2500),
  reminderDaysBeforeDue: integer("reminder_days_before_due")
    .notNull()
    .default(3),
});
