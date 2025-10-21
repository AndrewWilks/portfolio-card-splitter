import { Context } from "hono";
import { MerchantService } from "@backend/services";
import { z } from "zod";

const UpdateMerchantRequestSchema = z.object({
  name: z.string().min(1).optional(),
  mergeIntoId: z.string().uuid().optional(),
});

export async function apiMerchantsUpdate(
  c: Context,
  merchantService: MerchantService,
) {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    const validatedRequest = UpdateMerchantRequestSchema.parse(body);

    const merchant = await merchantService.updateMerchant(id, validatedRequest);

    return c.json({
      merchant: {
        id: merchant.id,
        name: merchant.name,
        normalizedName: merchant.name.toLowerCase(), // TODO: Implement proper normalization
        mergedIntoId: merchant.mergedIntoId || undefined,
        transactionCount: 0, // TODO: Implement transaction count
        createdAt: merchant.createdAt.toISOString(),
        updatedAt: merchant.updatedAt.toISOString(),
      },
      message: "Merchant updated successfully",
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
