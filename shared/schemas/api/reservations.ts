import { z } from "zod";

export const CreateReservationSchema = z.object({
  amount: z.number().int().positive(),
  description: z.string().min(1),
});
