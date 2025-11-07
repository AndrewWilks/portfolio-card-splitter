import { Card } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq, and, desc } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class CardRepository extends Repository<"Card"> {
  constructor() {
    super("Card");
  }

  async findByCardAccountId(cardAccountId: string): Promise<Card[]> {
    const results = await this.dbClient
      .select()
      .from(Tables.cards)
      .where(eq(Tables.cards.cardAccountId, cardAccountId))
      .orderBy(desc(Tables.cards.createdAt));

    return results.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Card(camelCaseData as any);
    });
  }

  async findByMemberId(memberId: string): Promise<Card[]> {
    const results = await this.dbClient
      .select()
      .from(Tables.cards)
      .where(eq(Tables.cards.memberId, memberId))
      .orderBy(desc(Tables.cards.createdAt));

    return results.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Card(camelCaseData as any);
    });
  }

  async findActiveByCardAccountId(cardAccountId: string): Promise<Card[]> {
    const results = await this.dbClient
      .select()
      .from(Tables.cards)
      .where(
        and(
          eq(Tables.cards.cardAccountId, cardAccountId),
          eq(Tables.cards.isActive, true)
        )
      )
      .orderBy(desc(Tables.cards.createdAt));

    return results.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Card(camelCaseData as any);
    });
  }
}
