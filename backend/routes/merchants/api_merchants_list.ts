import { Context } from "hono";
import { MerchantService } from "@backend/services";
import { z } from "zod";

const MerchantQuerySchema = z.object({
  search: z.string().optional(),
  limit: z.coerce.number().default(20),
});

export async function apiMerchantsList(
  c: Context,
  merchantService: MerchantService
) {
  try {
    const query = c.req.query();
    const validatedQuery = MerchantQuerySchema.parse(query);

    // TODO: Implement search and filtering in service
    const merchants = await merchantService.listMerchants(validatedQuery);

    return c.json({
      merchants: merchants.map((merchant) => ({
        id: merchant.id,
        name: merchant.name,
        normalizedName: merchant.name.toLowerCase(), // TODO: Implement proper normalization
        mergedIntoId: merchant.mergedIntoId || undefined,
        transactionCount: 0, // TODO: Implement transaction count
        createdAt: merchant.createdAt.toISOString(),
        updatedAt: merchant.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({ error: "Validation failed", details: error.issues }, 400);
    }
    if (error instanceof Error) {
      return c.json({ error: error.message }, 500);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
