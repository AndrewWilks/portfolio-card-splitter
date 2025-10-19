import { Context } from "hono";

export function apiPotsDeposit(c: Context) {
  // TODO: Implement POST /api/pots/:id/deposit endpoint to deposit funds to a pot
  // - Extract id from params
  // - Validate request body with DepositSchema
  // - Deposit using PotService
  // - Return success message
  return c.json({ message: "Not implemented" }, 501);
}
