import { Context } from "hono";
import { TransactionService } from "@backend/services";

export function apiTransactionsUpdate(
  _c: Context,
  _transactionService: TransactionService,
) {
  // TODO: Implement PATCH /api/transactions/:id endpoint to update a transaction
  // - Extract id from params
  // - Validate request body with UpdateTransactionSchema
  // - Update transaction using TransactionService
  // - Return transaction response with success message
  return _c.json({ message: "Not implemented" }, 501);
}
