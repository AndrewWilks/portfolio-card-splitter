import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { userRole } from "../enums/userRole.ts";

// Core tables

/**
 * Database table definition for `users`.
 *
 * Columns:
 * - id: UUID primary key
 * - email: unique user email
 * - passwordHash: hashed password
 * - firstName, lastName: user's name
 * - role: user role enum
 * - isActive: whether the user account is active
 * - createdAt, updatedAt: timestamps with timezone
 */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: userRole("role").notNull().default("user"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
