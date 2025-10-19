import { Context } from "hono";

export function apiPotsList(c: Context) {
  // TODO: Implement GET /api/pots endpoint to list pots
  // - Handle query parameters for filtering
  // - Return pots array with balances
  return c.json({ message: "Not implemented" }, 501);
}
