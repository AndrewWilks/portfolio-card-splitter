import { EventRepository } from "../repositories/index.ts";
import { Event } from "../entities/index.ts";

export class AuditService {
  constructor(private eventRepository: EventRepository) {}

  getAuditTrail(_query: Record<string, unknown>): Promise<Event[]> {
    throw new Error("Not implemented");
  }
}
