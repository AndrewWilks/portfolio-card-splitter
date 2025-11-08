import { pgTable, uuid } from "drizzle-orm/pg-core";

import { users } from "./users.ts";
import { token } from "./base/token.ts";

/**
 * Database table definition for `password_reset_tokens`.
 *
 * Stores tokens for password reset flows with expiry and usage tracking.
 */
export const passwordResetTokens = pgTable("password_reset_tokens", {
  ...token,
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id),
});
