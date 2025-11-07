import { Context } from "hono";
import { CardAccountService } from "@backend/services";

export async function apiCardAccountsGet(
  c: Context,
  cardAccountService: CardAccountService
) {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");

    const cardAccount = await cardAccountService.getCardAccount(id, user.id);

    if (!cardAccount) {
      return c.json({ error: "CardAccount not found" }, 404);
    }

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
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
