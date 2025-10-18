import { relations } from "drizzle-orm";

import { members } from "../tables/members.ts";
import { transactions } from "../tables/transactions.ts";
import { allocations } from "../tables/allocations.ts";

export const allocationsRelations = relations(allocations, ({ one }) => ({
  transaction: one(transactions, {
    fields: [allocations.transactionId],
    references: [transactions.id],
  }),
  member: one(members, {
    fields: [allocations.memberId],
    references: [members.id],
  }),
}));
