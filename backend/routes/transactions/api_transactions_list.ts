import { Context } from "hono";
import { TransactionService } from "@backend/services";

export async function apiTransactionsList(
  c: Context,
  transactionService: TransactionService
) {
  try {
    // Parse query parameters
    const query: Record<string, unknown> = {};

    const merchantId = c.req.query("merchantId");
    if (merchantId) query.merchantId = merchantId;

    const createdById = c.req.query("createdById");
    if (createdById) query.createdById = createdById;

    const type = c.req.query("type");
    if (type && (type === "expense" || type === "income")) {
      query.type = type;
    }

    // TODO: Add date range filtering when implemented in repository
    // const startDate = c.req.query("startDate");
    // const endDate = c.req.query("endDate");

    const transactions = await transactionService.listTransactions(query);

    return c.json({
      transactions: transactions.map((transaction) => ({
        id: transaction.id,
        merchantId: transaction.merchantId,
        description: transaction.description,
        amountCents: transaction.amountCents,
        type: transaction.type,
        transactionDate: transaction.transactionDate.toISOString(),
        createdById: transaction.createdById,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
      })),
      count: transactions.length,
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
