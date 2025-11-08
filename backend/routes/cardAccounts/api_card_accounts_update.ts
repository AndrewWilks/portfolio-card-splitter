import { Context } from "hono";
import { CardAccountService } from "@backend/services";
import { z } from "zod";

export async function apiCardAccountsUpdate(
  c: Context,
  cardAccountService: CardAccountService
) {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const body = await c.req.json();

    const cardAccount = await cardAccountService.updateCardAccount(
      id,
      body,
      user.id
    );

    return c.json({
      cardAccount: {
        id: cardAccount.id,
        name: cardAccount.name,
        issuer: cardAccount.issuer,
        last4: cardAccount.last4,
        billingCycle: cardAccount.billingCycle,
        creditLimitCents: cardAccount.creditLimitCents,
        ownerId: cardAccount.ownerId,
        isActive: cardAccount.isActive,
        createdAt: cardAccount.createdAt.toISOString(),
        updatedAt: cardAccount.updatedAt.toISOString(),
      },
      message: "CardAccount updated successfully",
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
