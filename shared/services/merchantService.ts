import { MerchantRepository, TagRepository } from "../repositories/index.ts";
import { Merchant, Tag } from "../entities/index.ts";

export class MerchantService {
  constructor(
    private merchantRepository: MerchantRepository,
    private tagRepository: TagRepository
  ) {}

  listMerchants(_query: Record<string, unknown>): Promise<Merchant[]> {
    throw new Error("Not implemented");
  }

  createMerchant(_request: unknown): Promise<Merchant> {
    throw new Error("Not implemented");
  }

  updateMerchant(_id: string, _request: unknown): Promise<Merchant> {
    throw new Error("Not implemented");
  }

  listTags(): Promise<Tag[]> {
    throw new Error("Not implemented");
  }

  createTag(_request: unknown): Promise<Tag> {
    throw new Error("Not implemented");
  }

  updateTag(_id: string, _request: unknown): Promise<Tag> {
    throw new Error("Not implemented");
  }
}
