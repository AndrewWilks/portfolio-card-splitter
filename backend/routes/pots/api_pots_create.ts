import { Context } from "hono";

export function apiPotsCreate(c: Context) {
  // TODO: Implement POST /api/pots endpoint to create a new pot
  // - Validate request body with CreatePotSchema
  // - Create pot using PotService
  // - Return pot response with success message
  return c.json({ message: "Not implemented" }, 501);
}
