import { TransactionService as SharedTransactionService } from "@shared/services";
import { Transaction } from "@shared/entities";

export class TransactionService extends SharedTransactionService {
  override listTransactions(
    _query: Record<string, unknown>,
  ): Promise<Transaction[]> {
    // TODO: Implement listTransactions method to query and return transactions based on query
    return Promise.reject(new Error("Not implemented"));
  }

  override createTransaction(_request: unknown): Promise<Transaction> {
    // TODO: Implement createTransaction method to create and save new transaction with allocations
    return Promise.reject(new Error("Not implemented"));
  }

  override updateTransaction(
    _id: string,
    _request: unknown,
  ): Promise<Transaction> {
    // TODO: Implement updateTransaction method to update existing transaction
    return Promise.reject(new Error("Not implemented"));
  }
}
