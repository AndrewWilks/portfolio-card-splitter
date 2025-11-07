import { CardAccountSettings } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class CardAccountSettingsRepository extends Repository<"CardAccountSettings"> {
  constructor() {
    super("CardAccountSettings");
  }

  async findByCardAccountId(
    cardAccountId: string
  ): Promise<CardAccountSettings | null> {
    const results = await this.dbClient
      .select()
      .from(Tables.cardAccountSettings)
      .where(eq(Tables.cardAccountSettings.cardAccountId, cardAccountId))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    const camelCaseData = objectKeysToCamel(
      results[0] as Record<string, unknown>
    );
    // deno-lint-ignore no-explicit-any
    return new CardAccountSettings(camelCaseData as any);
  }
}
