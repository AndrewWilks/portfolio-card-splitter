import { z } from "zod";

export const CreateTransactionSchema = z.object({
  amount: z.number().int().positive(),
  description: z.string().min(1),
  merchantId: z.string().uuid().optional(),
  tags: z.array(z.string().uuid()).optional(),
});

export const UpdateTransactionSchema = z.object({
  description: z.string().min(1).optional(),
  tags: z.array(z.string().uuid()).optional(),
});
