import { Allocation } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { eq } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class AllocationRepository extends Repository<"Allocation"> {
  constructor() {
    super("Allocation");
  }

  async findByTransactionId(transactionId: string): Promise<Allocation[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.allocations)
      .where(eq(Tables.allocations.transactionId, transactionId));

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Allocation(camelCaseData as any);
    });
  }

  async findByMemberId(memberId: string): Promise<Allocation[]> {
    const found = await this.dbClient
      .select()
      .from(Tables.allocations)
      .where(eq(Tables.allocations.memberId, memberId));

    if (found.length === 0) {
      return [];
    }

    return found.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);
      // deno-lint-ignore no-explicit-any
      return new Allocation(camelCaseData as any);
    });
  }
}
