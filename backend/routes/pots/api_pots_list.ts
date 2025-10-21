import { Context } from "hono";
import { PotService } from "@backend/services";

export async function apiPotsList(c: Context, potService: PotService) {
  try {
    // Parse query parameters
    const query: Record<string, unknown> = {};

    const ownerId = c.req.query("ownerId");
    if (ownerId) query.ownerId = ownerId;

    const pots = await potService.listPots(query);

    return c.json({
      pots: pots.map((pot) => ({
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
      })),
      count: pots.length,
    });
  } catch (error) {
    if (error instanceof Error) {
      return c.json({ error: error.message }, 400);
    }
    return c.json({ error: "Internal server error" }, 500);
  }
}
