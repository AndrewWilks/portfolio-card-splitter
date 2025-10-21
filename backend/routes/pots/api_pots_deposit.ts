import { Context } from "hono";
import { PotService } from "@backend/services";

export function apiPotsDeposit(_c: Context, _potService: PotService) {
  // TODO: Implement POST /api/pots/:id/deposit endpoint to deposit funds to a pot
  // - Extract id from params
  // - Validate request body with DepositSchema
  // - Deposit using PotService
  // - Return success message
  return _c.json({ message: "Not implemented" }, 501);
}
