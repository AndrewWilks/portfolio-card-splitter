import {
  MerchantRepository,
  TagRepository,
  TransactionRepository,
} from "../repositories/index.ts";
import { Transaction } from "../entities/index.ts";

export class TransactionService {
  constructor(
    private transactionRepository: TransactionRepository,
    private merchantRepository: MerchantRepository,
    private tagRepository: TagRepository,
  ) {}

  listTransactions(_query: Record<string, unknown>): Promise<Transaction[]> {
    throw new Error("Not implemented");
  }

  createTransaction(_request: unknown): Promise<Transaction> {
    throw new Error("Not implemented");
  }

  updateTransaction(_id: string, _request: unknown): Promise<Transaction> {
    throw new Error("Not implemented");
  }
}
