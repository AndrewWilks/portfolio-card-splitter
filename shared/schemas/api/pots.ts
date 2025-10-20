import { z } from "zod";

export const CreatePotSchema = z.object({
  name: z.string().min(1),
  targetAmount: z.number().int().positive().optional(),
});

export const UpdatePotSchema = z.object({
  name: z.string().min(1).optional(),
  targetAmount: z.number().int().positive().optional(),
});