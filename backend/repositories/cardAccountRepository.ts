import { CardAccount } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq, and, desc } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class CardAccountRepository extends Repository<"CardAccount"> {
  constructor() {
    super("CardAccount");
  }

  async findByOwnerId(ownerId: string): Promise<CardAccount[]> {
    const results = await this.dbClient
      .select()
      .from(Tables.cardAccounts)
      .where(eq(Tables.cardAccounts.ownerId, ownerId))
      .orderBy(desc(Tables.cardAccounts.createdAt));

    return results.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new CardAccount(camelCaseData as any);
    });
  }

  async findActiveByOwnerId(ownerId: string): Promise<CardAccount[]> {
    const results = await this.dbClient
      .select()
      .from(Tables.cardAccounts)
      .where(
        and(
          eq(Tables.cardAccounts.ownerId, ownerId),
          eq(Tables.cardAccounts.isActive, true)
        )
      )
      .orderBy(desc(Tables.cardAccounts.createdAt));

    return results.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new CardAccount(camelCaseData as any);
    });
  }
}
