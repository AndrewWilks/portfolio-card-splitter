import { assert } from "@std/assert";
import { apiPotsList } from "../../../routes/pots/api_pots_list.ts";
import { PotService } from "../../../services/index.ts";
import { PotRepository } from "../../../repositories/index.ts";
import { withTestDB } from "../../testHelpers.ts";

Deno.test("apiPotsList - returns pots for owner", async () => {
  await withTestDB(async () => {
    const repository = new PotRepository();
    const service = new PotService(repository);

    // Create test pots
    await service.createPot({
      name: "Test Pot 1",
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
    });

    await service.createPot({
      name: "Test Pot 2",
      type: "shared",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
    });

    const mockC = {
      req: {
        query: (key: string) =>
          key === "ownerId"
            ? "550e8400-e29b-41d4-a716-446655440000"
            : undefined,
      },
      json: (data: unknown) => {
        const responseData = data as { pots: unknown[]; count: number };
        assert(responseData.pots.length === 2);
        assert(responseData.count === 2);
        return new Response(JSON.stringify(data));
      },
    };

    await apiPotsList(
      mockC as unknown as Parameters<typeof apiPotsList>[0],
      service,
    );
  });
});

Deno.test("apiPotsList - handles errors", async () => {
  const repository = new PotRepository();
  const service = new PotService(repository);

  const mockC = {
    req: {
      query: () => undefined, // No ownerId
    },
    json: (data: unknown, status: number) => {
      assert(status === 400);
      return new Response(JSON.stringify(data), { status });
    },
  };

  await apiPotsList(
    mockC as unknown as Parameters<typeof apiPotsList>[0],
    service,
  );
});
