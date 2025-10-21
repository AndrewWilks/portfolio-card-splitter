import { relations } from "drizzle-orm";
import { transactions } from "../tables/transactions.ts";
import { merchants } from "../tables/merchants.ts";
import { users } from "../tables/users.ts";
import { allocations } from "../tables/allocations.ts";
import { reservations } from "../tables/reservations.ts";
import { payments } from "../tables/payment.ts";
import { transactionTags } from "../tables/transactionTags.ts";

/**
 * Relations for the `transactions` table.
 *
 * Defines relationships (e.g., transaction -> user, tags, payments).
 */
export const transactionsRelations = relations(
  transactions,
  ({ one, many }) => ({
    merchant: one(merchants, {
      fields: [transactions.merchantId],
      references: [merchants.id],
    }),
    createdBy: one(users, {
      fields: [transactions.createdById],
      references: [users.id],
    }),
    allocations: many(allocations),
    reservations: many(reservations),
    payments: many(payments),
    transactionTags: many(transactionTags),
  }),
);
