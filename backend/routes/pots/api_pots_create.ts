import { Context } from "hono";
import { PotService } from "@backend/services";

export function apiPotsCreate(_c: Context, _potService: PotService) {
  // TODO: Implement POST /api/pots endpoint to create a new pot
  // - Validate request body with CreatePotSchema
  // - Create pot using PotService
  // - Return pot response with success message
  return _c.json({ message: "Not implemented" }, 501);
}
