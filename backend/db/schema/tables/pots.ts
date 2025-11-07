import { pgTable, text, uuid } from "drizzle-orm/pg-core";

import { potType } from "../enums/potType.ts";

import { users } from "./users.ts";
import { entity } from "./base/entity.ts";

/**
 * Database table definition for `pots`.
 *
 * Represents monetary pots owned by users for holding allocated funds.
 */
export const pots = pgTable("pots", {
  ...entity,
  name: text("name").notNull(),
  description: text("description"),
  type: potType("type").notNull(),
  location: text("location"),
  ownerId: uuid("owner_id")
    .references(() => users.id)
    .notNull(),
});
