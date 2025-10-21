import { TagRepository as SharedTagRepository } from "@shared/repositories";
import { Tag } from "@shared/entities";

export class TagRepository extends SharedTagRepository {
  override save(_tag: Tag): Promise<void> {
    // TODO: Implement save method to insert tag into database
    return Promise.reject("Not implemented");
  }

  override findById(_id: string): Promise<Tag | null> {
    // TODO: Implement findById method to query tag by ID from database
    return Promise.reject("Not implemented");
  }

  override findAll(): Promise<Tag[]> {
    // TODO: Implement findAll method to query all tags from database
    return Promise.reject("Not implemented");
  }

  override findByName(_name: string): Promise<Tag | null> {
    // TODO: Implement findByName method to query tag by name from database
    return Promise.reject("Not implemented");
  }
}
