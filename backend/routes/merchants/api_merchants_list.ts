import { Context } from "hono";

export function apiMerchantsList(c: Context) {
  // TODO: Implement GET /api/merchants endpoint to list merchants
  // - Handle query parameters: search, limit
  // - Return merchants array
  return c.json({ message: "Not implemented" }, 501);
}
