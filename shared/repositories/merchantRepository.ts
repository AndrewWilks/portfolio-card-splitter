import { Merchant } from "@shared/entities";

interface I_MerchantRepository {
  save(merchant: Merchant): Promise<void>;
  findById(id: string): Promise<Merchant | null>;
  findByName(name: string): Promise<Merchant | null>;
}

export class MerchantRepository implements I_MerchantRepository {
  save(_merchant: Merchant): Promise<void> {
    return Promise.reject("Not implemented");
  }
  findById(_id: string): Promise<Merchant | null> {
    return Promise.reject("Not implemented");
  }
  findByName(_name: string): Promise<Merchant | null> {
    return Promise.reject("Not implemented");
  }
}
