import { Context } from "hono";
import { CardAccountService } from "@backend/services";

export async function apiCardAccountsDelete(
  c: Context,
  cardAccountService: CardAccountService
) {
  try {
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");

    await cardAccountService.deleteCardAccount(id, user.id);

    return c.json({
      message: "CardAccount deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
