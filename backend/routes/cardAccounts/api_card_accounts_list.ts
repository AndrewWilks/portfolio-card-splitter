import { Context } from "hono";
import { CardAccountService } from "@backend/services";

export async function apiCardAccountsList(
  c: Context,
  cardAccountService: CardAccountService
) {
  try {
    // Get user from auth middleware
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const cardAccounts = await cardAccountService.listCardAccounts(user.id);

    return c.json({
      cardAccounts: cardAccounts.map((ca) => ({
        id: ca.id,
        name: ca.name,
        issuer: ca.issuer,
        last4: ca.last4,
        billingCycle: ca.billingCycle,
        creditLimitCents: ca.creditLimitCents,
        ownerId: ca.ownerId,
        isActive: ca.isActive,
        createdAt: ca.createdAt.toISOString(),
        updatedAt: ca.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
