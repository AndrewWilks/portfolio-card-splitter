import { Context } from "hono";
import { AuditService } from "@backend/services";

export function apiAuditGet(_c: Context, _auditService: AuditService) {
  // TODO: Implement GET /api/audit endpoint to get audit trail
  // - Handle pagination parameters
  // - Return events array
  return _c.json({ message: "Not implemented" }, 501);
}
