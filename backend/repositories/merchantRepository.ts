import { Merchant } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class MerchantRepository extends Repository<"Merchant"> {
  constructor() {
    super("Merchant");
  }

  async findByName(name: string): Promise<Merchant | null> {
    const result = await this.dbClient
      .select()
      .from(Tables.merchants)
      .where(eq(Tables.merchants.name, name))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const camelCaseData = objectKeysToCamel(
      result[0] as Record<string, unknown>
    );
    // deno-lint-ignore no-explicit-any
    return new Merchant(camelCaseData as any);
  }
}
