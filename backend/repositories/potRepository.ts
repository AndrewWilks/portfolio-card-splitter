import { PotRepository as SharedPotRepository } from "@shared/repositories";
import { Pot } from "@shared/entities";

export class PotRepository extends SharedPotRepository {
  override save(_pot: Pot): Promise<void> {
    // TODO: Implement save method to insert pot into database
    return Promise.reject("Not implemented");
  }

  override findById(_id: string): Promise<Pot | null> {
    // TODO: Implement findById method to query pot by ID from database
    return Promise.reject("Not implemented");
  }

  override findByOwner(_ownerId: string): Promise<Pot[]> {
    // TODO: Implement findByOwner method to query pots by owner ID from database
    return Promise.reject("Not implemented");
  }

  override updateBalance(_id: string, _amount: number): Promise<void> {
    // TODO: Implement updateBalance method to update pot balance in database
    return Promise.reject("Not implemented");
  }

  override findAvailableBalances(): Promise<Record<string, number>> {
    // TODO: Implement findAvailableBalances method to query available balances for all pots from database
    return Promise.reject("Not implemented");
  }
}
