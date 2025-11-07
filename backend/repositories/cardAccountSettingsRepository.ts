import { CardAccountSettings } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class CardAccountSettingsRepository extends Repository<"CardAccountSettings"> {
  constructor() {
    super("CardAccountSettings");
  }

  // Override to handle numeric field conversion
  private convertDbToEntity(dbRow: Record<string, unknown>): CardAccountSettings {
    const camelCaseData = objectKeysToCamel(dbRow);
    
    // Convert numeric string fields to numbers
    if (typeof camelCaseData.minimumPaymentPercentage === "string") {
      camelCaseData.minimumPaymentPercentage = parseFloat(camelCaseData.minimumPaymentPercentage);
    }
    
    // deno-lint-ignore no-explicit-any
    return new CardAccountSettings(camelCaseData as any);
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

    return this.convertDbToEntity(results[0] as Record<string, unknown>);
  }

  // Override findById to use conversion
  override async findById(id: string): Promise<CardAccountSettings | null> {
    const results = await this.dbClient
      .select()
      .from(Tables.cardAccountSettings)
      .where(eq(Tables.cardAccountSettings.id, id))
      .limit(1);

    if (results.length === 0) {
      return null;
    }

    return this.convertDbToEntity(results[0] as Record<string, unknown>);
  }

  // Override save to convert returned data
  override async save(entity: CardAccountSettings): Promise<CardAccountSettings[]> {
    const results = await super.save(entity);
    // Convert the returned database rows
    return results.map(row => this.convertDbToEntity((row as unknown) as Record<string, unknown>));
  }
}
