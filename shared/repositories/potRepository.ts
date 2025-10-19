import { Pot } from "../entities/pot.ts";

interface I_PotRepository {
  save(pot: Pot): Promise<void>;
  findById(id: string): Promise<Pot | null>;
  findByOwner(ownerId: string): Promise<Pot[]>;
  updateBalance(id: string, amount: number): Promise<void>;
  findAvailableBalances(): Promise<Record<string, number>>;
}

export class PotRepository implements I_PotRepository {
  save(_pot: Pot): Promise<void> {
    return Promise.reject("Not implemented");
  }

  findById(_id: string): Promise<Pot | null> {
    return Promise.reject("Not implemented");
  }

  findByOwner(_ownerId: string): Promise<Pot[]> {
    return Promise.reject("Not implemented");
  }

  updateBalance(_id: string, _amount: number): Promise<void> {
    return Promise.reject("Not implemented");
  }

  findAvailableBalances(): Promise<Record<string, number>> {
    return Promise.reject("Not implemented");
  }
}
