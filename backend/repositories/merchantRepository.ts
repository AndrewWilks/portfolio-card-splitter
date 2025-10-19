import { MerchantRepository as SharedMerchantRepository } from "@shared/repositories";
import { Merchant } from "@shared/entities";

export class MerchantRepository extends SharedMerchantRepository {
  override save(_merchant: Merchant): Promise<void> {
    // TODO: Implement save method to insert merchant into database
    return Promise.reject("Not implemented");
  }

  override findById(_id: string): Promise<Merchant | null> {
    // TODO: Implement findById method to query merchant by ID from database
    return Promise.reject("Not implemented");
  }

  override findByName(_name: string): Promise<Merchant | null> {
    // TODO: Implement findByName method to query merchant by name from database
    return Promise.reject("Not implemented");
  }
}
