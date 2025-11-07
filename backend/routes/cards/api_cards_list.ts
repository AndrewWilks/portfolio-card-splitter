import { Context } from "hono";
import { CardService } from "@backend/services";

export async function apiCardsList(c: Context, cardService: CardService) {
  try {
    const cardAccountId = c.req.query("cardAccountId");
    const memberId = c.req.query("memberId");

    let cards;
    if (cardAccountId) {
      cards = await cardService.listCards(cardAccountId);
    } else if (memberId) {
      cards = await cardService.listCardsByMember(memberId);
    } else {
      return c.json(
        { error: "cardAccountId or memberId query parameter required" },
        400
      );
    }

    return c.json({
      cards: cards.map((card) => ({
        id: card.id,
        cardAccountId: card.cardAccountId,
        memberId: card.memberId,
        nickname: card.nickname,
        last4: card.last4,
        displayName: card.displayName,
        isActive: card.isActive,
        createdAt: card.createdAt.toISOString(),
        updatedAt: card.updatedAt.toISOString(),
      })),
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
