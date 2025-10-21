import { Context } from "hono";
import { PotService } from "@backend/services";

export async function apiPotsUpdate(c: Context, potService: PotService) {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();

    const pot = await potService.updatePot(id, body);

    return c.json({
      pot: {
        id: pot.id,
        name: pot.name,
        description: pot.description,
        type: pot.type,
        location: pot.location,
        ownerId: pot.ownerId,
        balanceCents: pot.balanceCents,
        isActive: pot.isActive,
        createdAt: pot.createdAt.toISOString(),
        updatedAt: pot.updatedAt.toISOString(),
      },
      message: "Pot updated successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
