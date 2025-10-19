import { AuditService as SharedAuditService } from "@shared/services";
import { Event } from "@shared/entities";

export class AuditService extends SharedAuditService {
  override getAuditTrail(_query: Record<string, unknown>): Promise<Event[]> {
    // TODO: Implement getAuditTrail method to query and return audit events
    return Promise.reject(new Error("Not implemented"));
  }
}
