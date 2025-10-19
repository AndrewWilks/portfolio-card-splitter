import { Context } from "hono";
import { MerchantService } from "@backend/services";

export function apiMerchantsCreate(
  _c: Context,
  _merchantService: MerchantService
) {
  // TODO: Implement POST /api/merchants endpoint to create a new merchant
  // - Validate request body with CreateMerchantSchema
  // - Create merchant using MerchantService
  // - Return merchant response with success message
  return _c.json({ message: "Not implemented" }, 501);
}
