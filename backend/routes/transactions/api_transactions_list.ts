import { Context } from "hono";
import { TransactionService } from "@backend/services";

export function apiTransactionsList(
  _c: Context,
  _transactionService: TransactionService
) {
  // TODO: Implement GET /api/transactions endpoint to list transactions
  // - Handle query parameters: limit, offset, memberId, potId, tagId, dateFrom, dateTo
  // - Return transactions array with pagination info
  return _c.json({ message: "Not implemented" }, 501);
}
