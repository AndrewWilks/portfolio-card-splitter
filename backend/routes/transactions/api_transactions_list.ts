import { Context } from "hono";

export function apiTransactionsList(c: Context) {
  // TODO: Implement GET /api/transactions endpoint to list transactions
  // - Handle query parameters: limit, offset, memberId, potId, tagId, dateFrom, dateTo
  // - Return transactions array with pagination info
  return c.json({ message: "Not implemented" }, 501);
}
