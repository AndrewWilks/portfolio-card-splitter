import { Context } from "hono";
import { LedgerService } from "@backend/services";

export function apiLedgerGet(_c: Context, _ledgerService: LedgerService) {
  // TODO: Implement GET /api/ledger endpoint to get ledger data
  // - Return balances and ledger information
  return _c.json({ message: "Not implemented" }, 501);
}
