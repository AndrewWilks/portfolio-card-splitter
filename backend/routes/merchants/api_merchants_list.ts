import { Context } from "hono";
import { MerchantService } from "@backend/services";

export function apiMerchantsList(
  _c: Context,
  _merchantService: MerchantService
) {
  // TODO: Implement GET /api/merchants endpoint to list merchants
  // - Handle query parameters: search, limit
  // - Return merchants array
  return _c.json({ message: "Not implemented" }, 501);
}
