import { EventRepository as SharedEventRepository } from "@shared/repositories";
import { Event } from "@shared/entities";

export class EventRepository extends SharedEventRepository {
  override save(_event: Event): Promise<void> {
    // TODO: Implement save method to insert event into database
    return Promise.reject("Not implemented");
  }

  override findByEntity(
    _entityType: string,
    _entityId: string
  ): Promise<Event[]> {
    // TODO: Implement findByEntity method to query events by entity type and ID from database
    return Promise.reject("Not implemented");
  }

  override findByActor(_actorId: string): Promise<Event[]> {
    // TODO: Implement findByActor method to query events by actor ID from database
    return Promise.reject("Not implemented");
  }
}
