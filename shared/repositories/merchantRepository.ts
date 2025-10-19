interface I_MerchantRepository {
  save(merchant: any): Promise<void>;
  findById(id: string): Promise<any | null>;
  findByName(name: string): Promise<any | null>;
}

export class MerchantRepository implements I_MerchantRepository {
  save(_merchant: any): Promise<void> {
    return Promise.reject("Not implemented");
  }
  findById(_id: string): Promise<any | null> {
    return Promise.reject("Not implemented");
  }
  findByName(_name: string): Promise<any | null> {
    return Promise.reject("Not implemented");
  }
}
