import { Tag } from "../entities/tag.ts";

interface I_TagRepository {
  save(tag: Tag): Promise<void>;
  findById(id: string): Promise<Tag | null>;
  findAll(): Promise<Tag[]>;
  findByName(name: string): Promise<Tag | null>;
}

export class TagRepository implements I_TagRepository {
  save(_tag: Tag): Promise<void> {
    return Promise.reject("Not implemented");
  }

  findById(_id: string): Promise<Tag | null> {
    return Promise.reject("Not implemented");
  }

  findAll(): Promise<Tag[]> {
    return Promise.reject("Not implemented");
  }

  findByName(_name: string): Promise<Tag | null> {
    return Promise.reject("Not implemented");
  }
}
