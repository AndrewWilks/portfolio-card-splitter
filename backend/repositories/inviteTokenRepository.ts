import { InviteToken } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq, lt } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class InviteTokenRepository extends Repository<"InviteToken"> {
  constructor() {
    super("InviteToken");
  }

  async findByEmail(email: string): Promise<InviteToken[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.inviteTokens)
      .where(eq(Tables.inviteTokens.email, email));

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new InviteToken(camelCaseData as any);
    });
  }

  async deleteExpired(): Promise<number> {
    const deleted = await this.dbClient
      .delete(Tables.inviteTokens)
      .where(lt(Tables.inviteTokens.expiresAt, new Date()))
      .returning();

    return deleted.length;
  }
}
