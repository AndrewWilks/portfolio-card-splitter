import { boolean, timestamp, uuid } from "drizzle-orm/pg-core";

export const entity = {
  id: uuid("id").primaryKey().defaultRandom(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};
