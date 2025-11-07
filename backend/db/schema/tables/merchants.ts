import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { entity } from "./base/entity.ts";

export const merchants = pgTable("merchants", {
  ...entity,
  name: text("name").notNull(),
  location: text("location"),
  mergedIntoId: uuid("merged_into_id"),
});
