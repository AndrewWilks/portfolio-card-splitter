import { Context } from "hono";

export function apiPotsUpdate(c: Context) {
  // TODO: Implement PATCH /api/pots/:id endpoint to update a pot
  // - Extract id from params
  // - Validate request body with UpdatePotSchema
  // - Update pot using PotService
  // - Return pot response with success message
  return c.json({ message: "Not implemented" }, 501);
}
