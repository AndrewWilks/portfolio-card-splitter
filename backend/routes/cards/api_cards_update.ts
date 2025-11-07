import { Context } from "hono";
import { CardService } from "@backend/services";
import { z } from "zod";

export async function apiCardsUpdate(c: Context, cardService: CardService) {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const card = await cardService.updateCard(id, body);

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
      message: "Card updated successfully",
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
