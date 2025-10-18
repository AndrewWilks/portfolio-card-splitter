import { relations } from "drizzle-orm";
import { tags } from "../tables/tags.ts";
import { transactionTags } from "../tables/transactionTags.ts";

/**
 * Relations for the `tags` table.
 *
 * Defines relationships from tags to transactions and other tables.
 */
export const tagsRelations = relations(tags, ({ many }) => ({
  transactionTags: many(transactionTags),
}));
