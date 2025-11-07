import { Context } from "hono";
import { CardService } from "@backend/services";

export async function apiCardsGet(c: Context, cardService: CardService) {
  try {
    const id = c.req.param("id");

    const card = await cardService.getCard(id);

    if (!card) {
      return c.json({ error: "Card not found" }, 404);
    }

    return c.json({
      card: {
        id: card.id,
        cardAccountId: card.cardAccountId,
        memberId: card.memberId,
        nickname: card.nickname,
        last4: card.last4,
        displayName: card.displayName,
        isActive: card.isActive,
        createdAt: card.createdAt.toISOString(),
        updatedAt: card.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
