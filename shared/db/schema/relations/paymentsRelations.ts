import { relations } from "drizzle-orm";
import { payments } from "../tables/payment.ts";
import { transactions } from "../tables/transactions.ts";
import { pots } from "../tables/pots.ts";
import { reservations } from "../tables/reservations.ts";
import { users } from "../tables/users.ts";

/**
 * Relations for the `payments` table.
 *
 * Defines relationships from payments to transactions, pots, reservations and creators.
 */
export const paymentsRelations = relations(payments, ({ one }) => ({
  transaction: one(transactions, {
    fields: [payments.transactionId],
    references: [transactions.id],
  }),
  pot: one(pots, {
    fields: [payments.potId],
    references: [pots.id],
  }),
  reservation: one(reservations, {
    fields: [payments.reservationId],
    references: [reservations.id],
  }),
  createdBy: one(users, {
    fields: [payments.createdById],
    references: [users.id],
  }),
}));
