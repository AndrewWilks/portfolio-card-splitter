import { Context } from "hono";
import { MerchantService } from "@backend/services";

export function apiMerchantsUpdate(
  _c: Context,
  _merchantService: MerchantService
) {
  // TODO: Implement PATCH /api/merchants/:id endpoint to update a merchant
  // - Extract id from params
  // - Handle rename or merge operations
  // - Update merchant using MerchantService
  // - Return merchant response with success message
  return _c.json({ message: "Not implemented" }, 501);
}
