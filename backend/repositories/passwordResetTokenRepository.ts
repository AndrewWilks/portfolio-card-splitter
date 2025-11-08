import { PasswordResetToken } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq, lt } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class PasswordResetTokenRepository extends Repository<"PasswordResetToken"> {
  constructor() {
    super("PasswordResetToken");
  }

  async findByUserId(userId: string): Promise<PasswordResetToken[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.passwordResetTokens)
      .where(eq(Tables.passwordResetTokens.userId, userId));

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new PasswordResetToken(camelCaseData as any);
    });
  }

  async deleteExpired(): Promise<number> {
    const deleted = await this.dbClient
      .delete(Tables.passwordResetTokens)
      .where(lt(Tables.passwordResetTokens.expiresAt, new Date()))
      .returning();

    return deleted.length;
  }
}
