import {
  bigint,
  boolean,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

import { potType } from "../enums/potType.ts";

import { users } from "./users.ts";

/**
 * Database table definition for `pots`.
 *
 * Represents monetary pots owned by users for holding allocated funds.
 */
export const pots = pgTable("pots", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  type: potType("type").notNull(),
  location: text("location"),
  ownerId: uuid("owner_id")
    .references(() => users.id)
    .notNull(),
  balanceCents: bigint("balance_cents", { mode: "number" })
    .notNull()
    .default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
