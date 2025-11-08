import { pgTable, text } from "drizzle-orm/pg-core";

import { userRole } from "../enums/userRole.ts";
import { entity } from "./base/entity.ts";

// Core tables

/**
 * Database table definition for `users`.
 *
 * Columns:
 * - email: unique user email
 * - passwordHash: hashed password
 * - firstName, lastName: user's name
 * - lastName: user's name
 * - role: user role enum
 */
export const users = pgTable("users", {
  ...entity,
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: userRole("role").notNull().default("user"),
});
