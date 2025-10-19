import { Context } from "hono";
import { PotService } from "@backend/services";

export function apiPotsUpdate(_c: Context, _potService: PotService) {
  // TODO: Implement PATCH /api/pots/:id endpoint to update a pot
  // - Extract id from params
  // - Validate request body with UpdatePotSchema
  // - Update pot using PotService
  // - Return pot response with success message
  return _c.json({ message: "Not implemented" }, 501);
}
