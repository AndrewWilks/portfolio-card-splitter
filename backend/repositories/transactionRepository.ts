import { TransactionRepository as SharedTransactionRepository } from "@shared/repositories";
import { Transaction, Allocation } from "@shared/entities";

export class TransactionRepository extends SharedTransactionRepository {
  override save(_transaction: Transaction): Promise<void> {
    // TODO: Implement save method to insert transaction into database
    return Promise.reject("Not implemented");
  }

  override findById(_id: string): Promise<Transaction | null> {
    // TODO: Implement findById method to query transaction by ID from database
    return Promise.reject("Not implemented");
  }

  override findByQuery(
    _query: Record<string, unknown>
  ): Promise<Transaction[]> {
    // TODO: Implement findByQuery method to query transactions by query parameters from database
    return Promise.reject("Not implemented");
  }

  override updateAllocations(
    _id: string,
    _allocations: Allocation[]
  ): Promise<void> {
    // TODO: Implement updateAllocations method to update transaction allocations in database
    return Promise.reject("Not implemented");
  }
}
