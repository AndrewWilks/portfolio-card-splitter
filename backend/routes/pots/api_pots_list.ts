import { Context } from "hono";
import { PotService } from "@backend/services";

export function apiPotsList(_c: Context, _potService: PotService) {
  // TODO: Implement GET /api/pots endpoint to list pots
  // - Handle query parameters for filtering
  // - Return pots array with balances
  return _c.json({ message: "Not implemented" }, 501);
}
