import { MerchantService as SharedMerchantService } from "@shared/services";
import { Merchant, Tag } from "@shared/entities";

export class MerchantService extends SharedMerchantService {
  override listMerchants(_query: Record<string, unknown>): Promise<Merchant[]> {
    // TODO: Implement listMerchants method to query and return merchants based on query
    return Promise.reject(new Error("Not implemented"));
  }

  override createMerchant(_request: unknown): Promise<Merchant> {
    // TODO: Implement createMerchant method to create and save new merchant
    return Promise.reject(new Error("Not implemented"));
  }

  override updateMerchant(_id: string, _request: unknown): Promise<Merchant> {
    // TODO: Implement updateMerchant method to update existing merchant
    return Promise.reject(new Error("Not implemented"));
  }

  override listTags(): Promise<Tag[]> {
    // TODO: Implement listTags method to return all tags
    return Promise.reject(new Error("Not implemented"));
  }

  override createTag(_request: unknown): Promise<Tag> {
    // TODO: Implement createTag method to create and save new tag
    return Promise.reject(new Error("Not implemented"));
  }

  override updateTag(_id: string, _request: unknown): Promise<Tag> {
    // TODO: Implement updateTag method to update existing tag
    return Promise.reject(new Error("Not implemented"));
  }
}
