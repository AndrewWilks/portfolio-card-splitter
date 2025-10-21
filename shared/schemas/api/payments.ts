import { z } from "zod";

export const CreatePaymentSchema = z.object({
  reservationId: z.string().uuid(),
  amount: z.number().int().positive(),
});
