import { Context } from "hono";

export function apiLedgerGet(c: Context) {
  // TODO: Implement GET /api/ledger endpoint to get ledger data
  // - Return balances and ledger information
  return c.json({ message: "Not implemented" }, 501);
}
