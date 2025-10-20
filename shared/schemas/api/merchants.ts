import { z } from "zod";

export const CreateMerchantSchema = z.object({
  name: z.string().min(1),
  category: z.string().min(1).optional(),
});

export const UpdateMerchantSchema = z.object({
  name: z.string().min(1).optional(),
  category: z.string().min(1).optional(),
});
