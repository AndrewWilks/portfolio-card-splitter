import { Context } from "hono";
import { MerchantService } from "@backend/services";
import { z } from "zod";

const CreateMerchantRequestSchema = z.object({
  name: z.string().min(1),
});

export async function apiMerchantsCreate(
  c: Context,
  merchantService: MerchantService
) {
  try {
    const body = await c.req.json();
    const validatedRequest = CreateMerchantRequestSchema.parse(body);

    const merchant = await merchantService.createMerchant(validatedRequest);

    return c.json({
      merchant: {
        id: merchant.id,
        name: merchant.name,
        normalizedName: merchant.name.toLowerCase(), // TODO: Implement proper normalization
        transactionCount: 0, // TODO: Implement transaction count
        createdAt: merchant.createdAt.toISOString(),
        updatedAt: merchant.updatedAt.toISOString(),
      },
      message: "Merchant created successfully",
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
