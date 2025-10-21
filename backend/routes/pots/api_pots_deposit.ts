import { Context } from "hono";
import { PotService } from "@backend/services";

export async function apiPotsDeposit(c: Context, potService: PotService) {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    await potService.deposit(id, body);

    return c.json({
      message: "Deposit successful",
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
