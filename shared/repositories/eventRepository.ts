import { Event } from "../entities/event.ts";

interface I_EventRepository {
  save(event: Event): Promise<void>;
  findByEntity(entityType: string, entityId: string): Promise<Event[]>;
  findByActor(actorId: string): Promise<Event[]>;
}

export class EventRepository implements I_EventRepository {
  save(_event: Event): Promise<void> {
    return Promise.reject("Not implemented");
  }

  findByEntity(_entityType: string, _entityId: string): Promise<Event[]> {
    return Promise.reject("Not implemented");
  }

  findByActor(_actorId: string): Promise<Event[]> {
    return Promise.reject("Not implemented");
  }
}
