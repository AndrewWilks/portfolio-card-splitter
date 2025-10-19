import { relations } from "drizzle-orm";
import { passwordResetTokens } from "../tables/passwordResetTokens.ts";
import { users } from "../tables/users.ts";

/**
 * Relations for the `password_reset_tokens` table.
 *
 * Defines relationships linking password reset tokens to users.
 */
export const passwordResetTokensRelations = relations(
  passwordResetTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [passwordResetTokens.userId],
      references: [users.id],
    }),
  })
);
