import { Context } from "hono";

export function apiMerchantsCreate(c: Context) {
  // TODO: Implement POST /api/merchants endpoint to create a new merchant
  // - Validate request body with CreateMerchantSchema
  // - Create merchant using MerchantService
  // - Return merchant response with success message
  return c.json({ message: "Not implemented" }, 501);
}
