import { Context } from "hono";

export function apiTransactionsCreate(c: Context) {
  // TODO: Implement POST /api/transactions endpoint to create a new transaction
  // - Validate request body with CreateTransactionSchema
  // - Handle allocations, merchant, tags
  // - Create transaction using TransactionService
  // - Return transaction response with success message
  return c.json({ message: "Not implemented" }, 501);
}
