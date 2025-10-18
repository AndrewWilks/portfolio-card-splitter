import { relations } from "drizzle-orm";
import { users } from "../tables/users.ts";
import { members } from "../tables/members.ts";
import { transactions } from "../tables/transactions.ts";
import { reservations } from "../tables/reservations.ts";
import { transfers } from "../tables/transfers.ts";
import { payments } from "../tables/payment.ts";
import { pots } from "../tables/pots.ts";
import { events } from "../tables/events.ts";
import { sessions } from "../tables/sessions.ts";

/**
 * Relations for the `users` table.
 *
 * Defines relationships from users to other tables (members, transactions, reservations, etc.).
 */
export const usersRelations = relations(users, ({ many }) => ({
  members: many(members),
  createdTransactions: many(transactions),
  createdReservations: many(reservations),
  createdTransfers: many(transfers),
  createdPayments: many(payments),
  ownedPots: many(pots),
  events: many(events),
  sessions: many(sessions),
}));
