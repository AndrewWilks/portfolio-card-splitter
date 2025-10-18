import { relations } from "drizzle-orm";
import { pots } from "../tables/pots.ts";
import { users } from "../tables/users.ts";
import { reservations } from "../tables/reservations.ts";
import { transfers } from "../tables/transfers.ts";
import { payments } from "../tables/payment.ts";

/**
 * Relations for the `pots` table.
 *
 * Defines relationships from pots to owners, allocations, reservations and transfers.
 */
export const potsRelations = relations(pots, ({ one, many }) => ({
  owner: one(users, {
    fields: [pots.ownerId],
    references: [users.id],
  }),
  reservations: many(reservations),
  fromTransfers: many(transfers, { relationName: "fromPot" }),
  toTransfers: many(transfers, { relationName: "toPot" }),
  payments: many(payments),
}));
