import { Context } from "hono";

export function apiMerchantsUpdate(c: Context) {
  // TODO: Implement PATCH /api/merchants/:id endpoint to update a merchant
  // - Extract id from params
  // - Handle rename or merge operations
  // - Update merchant using MerchantService
  // - Return merchant response with success message
  return c.json({ message: "Not implemented" }, 501);
}
