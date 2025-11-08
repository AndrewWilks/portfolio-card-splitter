import { Transfer } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq, or, isNull } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class TransferRepository extends Repository<"Transfer"> {
  constructor() {
    super("Transfer");
  }

  async findByPotId(potId: string): Promise<Transfer[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.transfers)
      .where(
        or(
          eq(Tables.transfers.fromPotId, potId),
          eq(Tables.transfers.toPotId, potId)
        )
      );

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Transfer(camelCaseData as any);
    });
  }

  async findCashTransfers(): Promise<Transfer[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.transfers)
      .where(
        or(isNull(Tables.transfers.fromPotId), isNull(Tables.transfers.toPotId))
      );

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Transfer(camelCaseData as any);
    });
  }
}
