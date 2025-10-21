import { Context } from "hono";
import { MerchantService } from "@backend/services";

export async function apiTagsList(
  c: Context,
  merchantService: MerchantService
) {
  try {
    const tags = await merchantService.listTags();

    return c.json({
      tags: tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        color: tag.color,
        transactionCount: 0, // TODO: Implement transaction count
        createdAt: tag.createdAt.toISOString(),
        updatedAt: tag.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
