import { Context } from "hono";
import { TransactionService } from "@backend/services";

export function apiTransactionsCreate(
  _c: Context,
  _transactionService: TransactionService,
) {
  // TODO: Implement POST /api/transactions endpoint to create a new transaction
  // - Validate request body with CreateTransactionSchema
  // - Handle allocations, merchant, tags
  // - Create transaction using TransactionService
  // - Return transaction response with success message
  return _c.json({ message: "Not implemented" }, 501);
}
