import { Context } from "hono";
import { CardService } from "@backend/services";

export async function apiCardsDelete(c: Context, cardService: CardService) {
  try {
    const id = c.req.param("id");

    await cardService.deleteCard(id);

    return c.json({
      message: "Card deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
