import { Allocation, Transaction } from "@shared/entities";
import { Repository } from "./base/repository.ts";
import { and, desc, eq, SQL } from "drizzle-orm";
import { Tables } from "@db/tables";
import { objectKeysToCamel } from "@shared/utilities";

export class TransactionRepository extends Repository<"Transaction"> {
  constructor() {
    super("Transaction");
  }

  async findByQuery(query: Record<string, unknown>): Promise<Transaction[]> {
    const conditions: SQL[] = [];

    // Build query conditions based on provided parameters
    if (query.cardAccountId) {
      conditions.push(
        eq(Tables.transactions.cardAccountId, query.cardAccountId as string)
      );
    }

    if (query.merchantId) {
      conditions.push(
        eq(Tables.transactions.merchantId, query.merchantId as string)
      );
    }

    if (query.createdById) {
      conditions.push(
        eq(Tables.transactions.createdById, query.createdById as string)
      );
    }

    if (query.type) {
      conditions.push(
        eq(Tables.transactions.type, query.type as "expense" | "income")
      );
    }

    // Date range filtering
    if (query.startDate) {
      // TODO: Add date range filtering
      conditions.push(
        eq(
          Tables.transactions.transactionDate,
          new Date(query.startDate as string)
        )
      );
    }

    if (query.endDate) {
      conditions.push(
        eq(
          Tables.transactions.transactionDate,
          new Date(query.endDate as string)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await this.dbClient
      .select()
      .from(Tables.transactions)
      .where(whereClause)
      .orderBy(desc(Tables.transactions.transactionDate));

    return results.map((row) => {
      const camelCaseData = objectKeysToCamel(row as Record<string, unknown>);

      // Filter out null optional fields
      if (camelCaseData.cardId === null) {
        delete camelCaseData.cardId;
      }

      // deno-lint-ignore no-explicit-any
      return new Transaction(camelCaseData as any);
    });
  }

  async updateAllocations(
    id: string,
    allocations: Allocation[]
  ): Promise<void> {
    // First, delete existing allocations for this transaction
    await this.dbClient
      .delete(Tables.allocations)
      .where(eq(Tables.allocations.transactionId, id));

    // Then insert the new allocations
    if (allocations.length > 0) {
      const allocationData = allocations.map((allocation) => allocation.toJSON);

      await this.dbClient.insert(Tables.allocations).values(allocationData);
    }
  }

  /**
   * Find all transactions for a specific CardAccount
   * @param cardAccountId - The CardAccount ID
   * @returns Array of transactions
   */
  findByCardAccountId(cardAccountId: string): Promise<Transaction[]> {
    return this.findByQuery({ cardAccountId });
  }
}
