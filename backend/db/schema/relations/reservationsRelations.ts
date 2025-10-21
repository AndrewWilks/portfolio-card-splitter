import { relations } from "drizzle-orm";
import { reservations } from "../tables/reservations.ts";
import { pots } from "../tables/pots.ts";
import { transactions } from "../tables/transactions.ts";
import { users } from "../tables/users.ts";
import { payments } from "../tables/payment.ts";

/**
 * Relations for the `reservations` table.
 *
 * Defines relationships linking reservations to users, pots, transactions, etc.
 */
export const reservationsRelations = relations(
  reservations,
  ({ one, many }) => ({
    pot: one(pots, {
      fields: [reservations.potId],
      references: [pots.id],
    }),
    transaction: one(transactions, {
      fields: [reservations.transactionId],
      references: [transactions.id],
    }),
    createdBy: one(users, {
      fields: [reservations.createdById],
      references: [users.id],
    }),
    payments: many(payments),
  }),
);
