import { boolean, pgTable, text } from "drizzle-orm/pg-core";
import { entity } from "./base/entity.ts";

/**
 * Database table definition for `tags`.
 *
 * Used to categorise transactions; includes display color and active flag.
 */
export const tags = pgTable("tags", {
  ...entity,
  name: text("name").notNull().unique(),
  color: text("color").notNull().default("#3b82f6"),
  isActive: boolean("is_active").notNull().default(true),
});
