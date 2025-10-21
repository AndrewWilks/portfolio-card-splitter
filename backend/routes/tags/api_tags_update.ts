import { Context } from "hono";
import { MerchantService } from "@backend/services";
import { z } from "zod";

const UpdateTagRequestSchema = z.object({
  name: z.string().min(1).optional(),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional(),
});

export async function apiTagsUpdate(
  c: Context,
  merchantService: MerchantService
) {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validatedRequest = UpdateTagRequestSchema.parse(body);

    const tag = await merchantService.updateTag(id, validatedRequest);

    return c.json({
      tag: {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        transactionCount: 0, // TODO: Implement transaction count
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
      },
      message: "Tag updated successfully",
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
