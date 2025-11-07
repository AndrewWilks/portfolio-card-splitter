import { Pot } from "@shared/entities";
import { PotRepository as _PotRepository } from "@backend/repositories";

/**
 * PotService - Manages pot operations and fund transfers
 *
 * TODO: Implement service following the new pattern:
 * - Add constructor with PotRepository injection
 * - Implement listPots() with query filtering
 * - Implement createPot() using Pot.createSchema for validation
 * - Implement updatePot() using Pot.updateSchema for validation
 * - Implement deposit() for fund management
 * - Consider adding withdraw() method
 */
export class PotService {
  // TODO: Add constructor(private potRepo: PotRepository) {}
  listPots(_query: Record<string, unknown>): Promise<Pot[]> {
    // TODO: Implement listPots method to query and return pots based on query
    return Promise.reject(new Error("Not implemented"));
  }

  createPot(_request: unknown): Promise<Pot> {
    // TODO: Implement createPot method to create and save new pot
    return Promise.reject(new Error("Not implemented"));
  }

  updatePot(_id: string, _request: unknown): Promise<Pot> {
    // TODO: Implement updatePot method to update existing pot
    return Promise.reject(new Error("Not implemented"));
  }

  deposit(_id: string, _request: unknown): Promise<void> {
    // TODO: Implement deposit method to add funds to pot
    return Promise.reject(new Error("Not implemented"));
  }
}
