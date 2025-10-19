import { TransferRepository as SharedTransferRepository } from "@shared/repositories";
import { Transfer } from "@shared/entities";

export class TransferRepository extends SharedTransferRepository {
  override save(_transfer: Transfer): Promise<void> {
    // TODO: Implement save method to insert transfer into database
    return Promise.reject("Not implemented");
  }

  override findById(_id: string): Promise<Transfer | null> {
    // TODO: Implement findById method to query transfer by ID from database
    return Promise.reject("Not implemented");
  }

  override findByPotId(_potId: string): Promise<Transfer[]> {
    // TODO: Implement findByPotId method to query transfers by pot ID from database
    return Promise.reject("Not implemented");
  }
}
