import { Event } from "@shared/entities";
import { EventRepository as _EventRepository } from "@backend/repositories";

/**
 * AuditService - Handles audit trail and event logging
 *
 * TODO: Implement service following the new pattern:
 * - Add constructor with EventRepository injection
 * - Implement getAuditTrail() method to query events
 * - Use Event.createSchema for validation if needed
 * - Remove override keywords (no base class)
 */
export class AuditService {
  // TODO: Add constructor(private eventRepo: EventRepository) {}

  getAuditTrail(_query: Record<string, unknown>): Promise<Event<unknown>[]> {
    // TODO: Implement getAuditTrail method to query and return audit events
    return Promise.reject(new Error("Not implemented"));
  }
}
