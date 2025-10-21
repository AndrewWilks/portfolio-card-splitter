import { Context } from "hono";
import { PotService } from "@backend/services";

export async function apiPotsCreate(c: Context, potService: PotService) {
  try {
    const body = await c.req.json();

    const pot = await potService.createPot(body);

    return c.json(
      {
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
        message: "Pot created successfully",
      },
      201
    );
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
