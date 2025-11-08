import { relations } from "drizzle-orm";
import { transfers } from "../tables/transfers.ts";
import { pots } from "../tables/pots.ts";

/**
 * Relations for the `transfers` table.
 *
 * Defines relationships from transfers to related tables (e.g., pots).
 */
export const transfersRelations = relations(transfers, ({ one }) => ({
  fromPot: one(pots, {
    fields: [transfers.fromPotId],
    references: [pots.id],
    relationName: "fromPot",
  }),
  toPot: one(pots, {
    fields: [transfers.toPotId],
    references: [pots.id],
    relationName: "toPot",
  }),
}));
