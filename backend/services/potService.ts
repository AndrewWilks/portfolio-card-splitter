import { PotService as SharedPotService } from "@shared/services";
import { Pot } from "@shared/entities";

export class PotService extends SharedPotService {
  override listPots(_query: Record<string, unknown>): Promise<Pot[]> {
    // TODO: Implement listPots method to query and return pots based on query
    return Promise.reject(new Error("Not implemented"));
  }

  override createPot(_request: unknown): Promise<Pot> {
    // TODO: Implement createPot method to create and save new pot
    return Promise.reject(new Error("Not implemented"));
  }

  override updatePot(_id: string, _request: unknown): Promise<Pot> {
    // TODO: Implement updatePot method to update existing pot
    return Promise.reject(new Error("Not implemented"));
  }

  override deposit(_id: string, _request: unknown): Promise<void> {
    // TODO: Implement deposit method to add funds to pot
    return Promise.reject(new Error("Not implemented"));
  }
}
