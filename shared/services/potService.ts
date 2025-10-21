import { PotRepository } from "../repositories/index.ts";
import { Pot } from "../entities/index.ts";

export class PotService {
  constructor(private potRepository: PotRepository) {}

  listPots(_query: Record<string, unknown>): Promise<Pot[]> {
    throw new Error("Not implemented");
  }

  createPot(_request: unknown): Promise<Pot> {
    throw new Error("Not implemented");
  }

  updatePot(_id: string, _request: unknown): Promise<Pot> {
    throw new Error("Not implemented");
  }

  deposit(_id: string, _request: unknown): Promise<void> {
    throw new Error("Not implemented");
  }
}
