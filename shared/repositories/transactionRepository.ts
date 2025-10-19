import { Transaction, Allocation } from "../entities/index.ts";

interface I_TransactionRepository {
  save(transaction: Transaction): Promise<void>;
  findById(id: string): Promise<Transaction | null>;
  findByQuery(query: Record<string, unknown>): Promise<Transaction[]>;
  updateAllocations(id: string, allocations: Allocation[]): Promise<void>;
}

export class TransactionRepository implements I_TransactionRepository {
  save(_transaction: Transaction): Promise<void> {
    return Promise.reject("Not implemented");
  }

  findById(_id: string): Promise<Transaction | null> {
    return Promise.reject("Not implemented");
  }

  findByQuery(_query: Record<string, unknown>): Promise<Transaction[]> {
    return Promise.reject("Not implemented");
  }

  updateAllocations(_id: string, _allocations: Allocation[]): Promise<void> {
    return Promise.reject("Not implemented");
  }
}
