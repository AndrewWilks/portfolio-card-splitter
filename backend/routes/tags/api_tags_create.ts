import { Context } from "hono";
import { MerchantService } from "@backend/services";
import { z } from "zod";

const CreateTagRequestSchema = z.object({
  name: z.string().min(1),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
});

export async function apiTagsCreate(
  c: Context,
  merchantService: MerchantService
) {
  try {
    const body = await c.req.json();
    const validatedRequest = CreateTagRequestSchema.parse(body);

    const tag = await merchantService.createTag(validatedRequest);

    return c.json({
      tag: {
        id: tag.id,
        name: tag.name,
        color: tag.color,
        transactionCount: 0, // TODO: Implement transaction count
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
      },
      message: "Tag created successfully",
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
