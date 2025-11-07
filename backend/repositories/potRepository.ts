import { Pot } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class PotRepository extends Repository<"Pot"> {
  constructor() {
    super("Pot");
  }

  async findByOwner(ownerId: string): Promise<Pot[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.pots)
      .where(eq(Tables.pots.ownerId, ownerId));

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Pot(camelCaseData as any);
    });
  }

  // Note: Balance is calculated from transfers/payments, not stored directly
  // These methods should be implemented in the service layer
}
