import { pgTable, text } from "drizzle-orm/pg-core";

import { userRole } from "../enums/userRole.ts";
import { token } from "./base/token.ts";

/**
 * Database table definition for `invite_tokens`.
 *
 * Stores one-time invite tokens issued to emails with a role and expiry.
 */
export const inviteTokens = pgTable("invite_tokens", {
  ...token,
  email: text("email").notNull(),
  role: userRole("role").notNull().default("member"),
});
