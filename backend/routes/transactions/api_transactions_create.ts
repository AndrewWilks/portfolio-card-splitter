import { Context } from "hono";
import { TransactionService } from "@backend/services";
import { z } from "zod";

const CreateTransactionRequestSchema = z.object({
  merchantId: z.string().uuid(),
  description: z.string().min(1).max(500),
  amountCents: z.number().int().positive(),
  type: z.enum(["expense", "income"]).default("expense"),
  transactionDate: z.string().datetime().optional(),
  tagIds: z.array(z.string().uuid()).optional(),
  allocations: z
    .array(
      z.object({
        memberId: z.string().uuid(),
        rule: z.enum(["percentage", "fixed_amount"]),
        percentage: z.number().int().min(0).max(10000).optional(),
        amountCents: z.number().int().min(0).optional(),
      })
    )
    .min(1),
});

export async function apiTransactionsCreate(
  c: Context,
  transactionService: TransactionService
) {
  try {
    const body = await c.req.json();
    const validatedRequest = CreateTransactionRequestSchema.parse(body);

    const transaction = await transactionService.createTransaction(
      validatedRequest
    );

    return c.json({
      transaction: {
        id: transaction.id,
        merchantId: transaction.merchantId,
        description: transaction.description,
        amountCents: transaction.amountCents,
        type: transaction.type,
        transactionDate: transaction.transactionDate.toISOString(),
        createdById: transaction.createdById,
        createdAt: transaction.createdAt.toISOString(),
        updatedAt: transaction.updatedAt.toISOString(),
      },
      message: "Transaction created successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation failed", details: error.issues }, 400);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
