import { z } from "zod";

export const CreateTransferSchema = z.object({
  fromPotId: z.string().uuid(),
  toPotId: z.string().uuid(),
  amount: z.number().int().positive(),
  description: z.string().min(1),
});