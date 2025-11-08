import { timestamp, uuid } from "drizzle-orm/pg-core";
import { calculateExpirationDate } from "../../../../../shared/utilities/calculateExpirationDate.ts";

export const token = {
  id: uuid("id").primaryKey().defaultRandom(),
  usedAt: timestamp("used_at", { withTimezone: true }),
  expiresAt: timestamp("expires_at", { withTimezone: true })
    .default(calculateExpirationDate(7 * 24)) // default to 7 days
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};
