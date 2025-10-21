import { assert } from "@std/assert";
import { PotService } from "../../services/index.ts";
import { PotRepository } from "../../repositories/index.ts";
import { withTestDB } from "../testHelpers.ts";

Deno.test("PotService - create", () => {
  // TODO: Test pot creation
});

Deno.test("PotService - deposit", () => {
  // TODO: Test pot deposit
});

// TODO: Add more test cases for PotService methods

Deno.test("PotService - can be instantiated", () => {
  const repository = new PotRepository();
  const service = new PotService(repository);
  assert(service instanceof PotService);
});

Deno.test("PotService - listPots method exists", () => {
  const repository = new PotRepository();
  const service = new PotService(repository);
  assert(typeof service.listPots === "function");
});

Deno.test("PotService - createPot method exists", () => {
  const repository = new PotRepository();
  const service = new PotService(repository);
  assert(typeof service.createPot === "function");
});

Deno.test("PotService - updatePot method exists", () => {
  const repository = new PotRepository();
  const service = new PotService(repository);
  assert(typeof service.updatePot === "function");
});

Deno.test("PotService - deposit method exists", () => {
  const repository = new PotRepository();
  const service = new PotService(repository);
  assert(typeof service.deposit === "function");
});

Deno.test("PotService - createPot creates and saves pot", async () => {
  await withTestDB(async () => {
    const repository = new PotRepository();
    const service = new PotService(repository);

    const request = {
      name: "New Test Pot",
      description: "A test pot for service testing",
      type: "solo" as const,
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
    };

    const pot = await service.createPot(request);

    assert(pot.name === request.name);
    assert(pot.description === request.description);
    assert(pot.type === request.type);
    assert(pot.ownerId === request.ownerId);
    assert(pot.balanceCents === 0);
    assert(pot.isActive === true);

    // Verify it was saved
    const saved = await repository.findById(pot.id);
    assert(saved !== null);
    assert(saved!.name === request.name);
  });
});

Deno.test("PotService - createPot validates required fields", async () => {
  const repository = new PotRepository();
  const service = new PotService(repository);

  try {
    await service.createPot({
      name: "", // Invalid empty name
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
    });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test("PotService - listPots filters by owner", async () => {
  await withTestDB(async () => {
    const repository = new PotRepository();
    const service = new PotService(repository);

    const ownerId1 = "550e8400-e29b-41d4-a716-446655440000";
    const ownerId2 = "550e8400-e29b-41d4-a716-446655440001";

    // Create pots for owner 1
    await service.createPot({
      name: "Owner 1 Pot 1",
      type: "solo",
      ownerId: ownerId1,
    });

    await service.createPot({
      name: "Owner 1 Pot 2",
      type: "shared",
      ownerId: ownerId1,
    });

    // Create pot for owner 2
    await service.createPot({
      name: "Owner 2 Pot",
      type: "solo",
      ownerId: ownerId2,
    });

    const owner1Pots = await service.listPots({ ownerId: ownerId1 });
    assert(owner1Pots.length === 2);
    assert(owner1Pots.every((p) => p.ownerId === ownerId1));

    const owner2Pots = await service.listPots({ ownerId: ownerId2 });
    assert(owner2Pots.length === 1);
    assert(owner2Pots[0].ownerId === ownerId2);
  });
});

Deno.test("PotService - listPots requires ownerId", async () => {
  const repository = new PotRepository();
  const service = new PotService(repository);

  try {
    await service.listPots({});
    assert(false, "Should have thrown error for missing ownerId");
  } catch (error) {
    assert(error instanceof Error);
    assert(error.message === "ownerId is required");
  }
});

Deno.test("PotService - updatePot updates existing pot", async () => {
  await withTestDB(async () => {
    const repository = new PotRepository();
    const service = new PotService(repository);

    const pot = await service.createPot({
      name: "Original Name",
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
    });

    const updated = await service.updatePot(pot.id, {
      name: "Updated Name",
      description: "Updated description",
      type: "shared",
    });

    assert(updated.name === "Updated Name");
    assert(updated.description === "Updated description");
    assert(updated.type === "shared");

    // Verify in database
    const saved = await repository.findById(pot.id);
    assert(saved!.name === "Updated Name");
  });
});

Deno.test(
  "PotService - updatePot throws error for non-existent pot",
  async () => {
    const repository = new PotRepository();
    const service = new PotService(repository);

    try {
      await service.updatePot("non-existent-id", { name: "New Name" });
      assert(false, "Should have thrown error for non-existent pot");
    } catch (error) {
      assert(error instanceof Error);
      assert(error.message.includes("not found"));
    }
  }
);

Deno.test("PotService - deposit adds funds to pot", async () => {
  await withTestDB(async () => {
    const repository = new PotRepository();
    const service = new PotService(repository);

    const pot = await service.createPot({
      name: "Deposit Test Pot",
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
    });

    await service.deposit(pot.id, { amountCents: 500 });

    const updated = await repository.findById(pot.id);
    assert(updated!.balanceCents === 500);
  });
});

Deno.test("PotService - deposit validates positive amount", async () => {
  await withTestDB(async () => {
    const repository = new PotRepository();
    const service = new PotService(repository);

    const pot = await service.createPot({
      name: "Deposit Test Pot",
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
    });

    try {
      await service.deposit(pot.id, { amountCents: -100 });
      assert(false, "Should have thrown validation error");
    } catch (error) {
      assert(error instanceof Error);
    }
  });
});

Deno.test("PotService - deposit throws error for inactive pot", async () => {
  await withTestDB(async () => {
    const repository = new PotRepository();
    const service = new PotService(repository);

    const pot = await service.createPot({
      name: "Inactive Pot",
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
    });

    // Deactivate the pot
    await service.updatePot(pot.id, { isActive: false });

    try {
      await service.deposit(pot.id, { amountCents: 100 });
      assert(false, "Should have thrown error for inactive pot");
    } catch (error) {
      assert(error instanceof Error);
      assert(error.message.includes("inactive pot"));
    }
  });
});

Deno.test(
  "PotService - deposit throws error for non-existent pot",
  async () => {
    const repository = new PotRepository();
    const service = new PotService(repository);

    try {
      await service.deposit("non-existent-id", { amountCents: 100 });
      assert(false, "Should have thrown error for non-existent pot");
    } catch (error) {
      assert(error instanceof Error);
      assert(error.message.includes("not found"));
    }
  }
);
