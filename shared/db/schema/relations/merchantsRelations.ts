import { relations } from "drizzle-orm";
import { merchants } from "../tables/merchants.ts";
import { transactions } from "../tables/transactions.ts";

/**
 * Relations for the `merchants` table.
 *
 * Defines relationships from merchants to transactions and merged merchant hierarchy.
 */
export const merchantsRelations = relations(merchants, ({ one, many }) => ({
  mergedInto: one(merchants, {
    fields: [merchants.mergedIntoId],
    references: [merchants.id],
  }),
  mergedMerchants: many(merchants),
  transactions: many(transactions),
}));
