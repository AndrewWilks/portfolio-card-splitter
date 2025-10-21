import { TransactionRepository as SharedTransactionRepository } from "@shared/repositories";
import { Allocation, Transaction } from "@shared/entities";
import { db, Schemas } from "@db";
import { and, desc, eq, SQL } from "drizzle-orm";

export class TransactionRepository extends SharedTransactionRepository {
  constructor(private dbClient = db) {
    super();
  }

  override async save(transaction: Transaction): Promise<void> {
    const data = transaction.toJSON();
    await this.dbClient
      .insert(Schemas.Tables.transactions)
      .values({
        id: data.id,
        merchantId: data.merchantId,
        description: data.description,
        amountCents: data.amountCents,
        type: data.type,
        transactionDate: data.transactionDate,
        createdById: data.createdById,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
      .onConflictDoUpdate({
        target: Schemas.Tables.transactions.id,
        set: {
          merchantId: data.merchantId,
          description: data.description,
          amountCents: data.amountCents,
          type: data.type,
          transactionDate: data.transactionDate,
          createdById: data.createdById,
          updatedAt: data.updatedAt,
        },
      });
  }

  override async findById(id: string): Promise<Transaction | null> {
    const result = await this.dbClient
      .select()
      .from(Schemas.Tables.transactions)
      .where(eq(Schemas.Tables.transactions.id, id))
      .limit(1);

    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return Transaction.from({
      ...row,
      transactionDate: new Date(row.transactionDate),
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt),
    });
  }

  override async findByQuery(
    query: Record<string, unknown>,
  ): Promise<Transaction[]> {
    const conditions: SQL[] = [];

    // Build query conditions based on provided parameters
    if (query.merchantId) {
      conditions.push(
        eq(Schemas.Tables.transactions.merchantId, query.merchantId as string),
      );
    }

    if (query.createdById) {
      conditions.push(
        eq(
          Schemas.Tables.transactions.createdById,
          query.createdById as string,
        ),
      );
    }

    if (query.type) {
      conditions.push(
        eq(
          Schemas.Tables.transactions.type,
          query.type as "expense" | "income",
        ),
      );
    }

    // Date range filtering
    if (query.startDate) {
      // TODO: Add date range filtering
    }

    if (query.endDate) {
      // TODO: Add date range filtering
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const results = await this.dbClient
      .select()
      .from(Schemas.Tables.transactions)
      .where(whereClause)
      .orderBy(desc(Schemas.Tables.transactions.transactionDate));

    return results.map((row) =>
      Transaction.from({
        ...row,
        transactionDate: new Date(row.transactionDate),
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
      })
    );
  }

  override async updateAllocations(
    id: string,
    allocations: Allocation[],
  ): Promise<void> {
    // First, delete existing allocations for this transaction
    await this.dbClient
      .delete(Schemas.Tables.allocations)
      .where(eq(Schemas.Tables.allocations.transactionId, id));

    // Then insert the new allocations
    if (allocations.length > 0) {
      const allocationData = allocations.map((allocation) => {
        const data = allocation.toJSON();
        return {
          id: data.id,
          transactionId: data.transactionId,
          memberId: data.memberId,
          rule: data.rule,
          percentage: data.percentage || null,
          amountCents: data.amountCents || null,
          calculatedAmountCents: data.calculatedAmountCents,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      });

      await this.dbClient
        .insert(Schemas.Tables.allocations)
        .values(allocationData);
    }
  }
}
