import { z } from "zod";

export const CreateTagSchema = z.object({
  name: z.string().min(1),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});

export const UpdateTagSchema = z.object({
  name: z.string().min(1).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i)
    .optional(),
});
