import { pgTable, uuid, timestamp } from "drizzle-orm/pg-core";

import { tags } from "./tags.ts";
import { transactions } from "./transactions.ts";

/**
 * Database table definition for `transaction_tags`.
 *
 * Join table linking transactions and tags for categorisation.
 */
export const transactionTags = pgTable("transaction_tags", {
  id: uuid("id").primaryKey().defaultRandom(),
  transactionId: uuid("transaction_id")
    .references(() => transactions.id)
    .notNull(),
  tagId: uuid("tag_id")
    .references(() => tags.id)
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
