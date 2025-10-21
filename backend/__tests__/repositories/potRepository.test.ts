import { assert } from "@std/assert";
import { PotRepository } from "../../repositories/index.ts";
import { Pot } from "@shared/entities";
import { withTestDB } from "../testHelpers.ts";

Deno.test("PotRepository - create", () => {
  // TODO: Test pot creation
});

Deno.test("PotRepository - findById", () => {
  // TODO: Test finding pot by ID
});

// TODO: Add more test cases for PotRepository methods

Deno.test("PotRepository - can be instantiated", () => {
  const repository = new PotRepository();
  assert(repository instanceof PotRepository);
});

Deno.test("PotRepository - save method exists", () => {
  const repository = new PotRepository();
  assert(typeof repository.save === "function");
});

Deno.test("PotRepository - findById method exists", () => {
  const repository = new PotRepository();
  assert(typeof repository.findById === "function");
});

Deno.test("PotRepository - findByOwner method exists", () => {
  const repository = new PotRepository();
  assert(typeof repository.findByOwner === "function");
});

Deno.test("PotRepository - updateBalance method exists", () => {
  const repository = new PotRepository();
  assert(typeof repository.updateBalance === "function");
});

Deno.test("PotRepository - findAvailableBalances method exists", () => {
  const repository = new PotRepository();
  assert(typeof repository.findAvailableBalances === "function");
});

Deno.test("PotRepository - save and findById integration", async () => {
  await withTestDB(async () => {
    const repository = new PotRepository();

    const pot = Pot.create({
      name: "Test Pot",
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
      balanceCents: 1000,
      isActive: true,
    });

    await repository.save(pot);

    const found = await repository.findById(pot.id);
    assert(found !== null);
    assert(found!.id === pot.id);
    assert(found!.name === pot.name);
    assert(found!.balanceCents === pot.balanceCents);
  });
});

Deno.test("PotRepository - findByOwner returns correct pots", async () => {
  await withTestDB(async () => {
    const repository = new PotRepository();
    const ownerId = "550e8400-e29b-41d4-a716-446655440000";

    const pot1 = Pot.create({
      name: "Pot 1",
      type: "solo",
      ownerId,
      balanceCents: 1000,
      isActive: true,
    });

    const pot2 = Pot.create({
      name: "Pot 2",
      type: "shared",
      ownerId,
      balanceCents: 2000,
      isActive: true,
    });

    const pot3 = Pot.create({
      name: "Pot 3",
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440001", // Different owner
      balanceCents: 3000,
      isActive: true,
    });

    await repository.save(pot1);
    await repository.save(pot2);
    await repository.save(pot3);

    const ownerPots = await repository.findByOwner(ownerId);
    assert(ownerPots.length === 2);
    assert(ownerPots.some((p) => p.name === "Pot 1"));
    assert(ownerPots.some((p) => p.name === "Pot 2"));
    assert(!ownerPots.some((p) => p.name === "Pot 3"));
  });
});

Deno.test(
  "PotRepository - updateBalance updates balance correctly",
  async () => {
    await withTestDB(async () => {
      const repository = new PotRepository();

      const pot = Pot.create({
        name: "Balance Test Pot",
        type: "solo",
        ownerId: "550e8400-e29b-41d4-a716-446655440000",
        balanceCents: 1000,
        isActive: true,
      });

      await repository.save(pot);

      await repository.updateBalance(pot.id, 2500);

      const updated = await repository.findById(pot.id);
      assert(updated!.balanceCents === 2500);
    });
  },
);

Deno.test(
  "PotRepository - findAvailableBalances returns active pots only",
  async () => {
    await withTestDB(async () => {
      const repository = new PotRepository();

      const activePot = Pot.create({
        name: "Active Pot",
        type: "solo",
        ownerId: "550e8400-e29b-41d4-a716-446655440000",
        balanceCents: 1000,
        isActive: true,
      });

      const inactivePot = Pot.create({
        name: "Inactive Pot",
        type: "solo",
        ownerId: "550e8400-e29b-41d4-a716-446655440000",
        balanceCents: 2000,
        isActive: false,
      });

      await repository.save(activePot);
      await repository.save(inactivePot);

      const balances = await repository.findAvailableBalances();
      assert(Object.keys(balances).length === 1);
      assert(balances[activePot.id] === 1000);
      assert(!(inactivePot.id in balances));
    });
  },
);

Deno.test("PotRepository - save updates existing pot", async () => {
  await withTestDB(async () => {
    const repository = new PotRepository();

    const pot = Pot.create({
      name: "Original Name",
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
      balanceCents: 1000,
      isActive: true,
    });

    await repository.save(pot);

    const updatedPot = Pot.from({
      ...pot.toJSON(),
      name: "Updated Name",
      balanceCents: 2000,
    });

    await repository.save(updatedPot);

    const found = await repository.findById(pot.id);
    assert(found!.name === "Updated Name");
    assert(found!.balanceCents === 2000);
  });
});

Deno.test(
  "PotRepository - findById returns null for non-existent pot",
  async () => {
    await withTestDB(async () => {
      const repository = new PotRepository();

      const found = await repository.findById("non-existent-id");
      assert(found === null);
    });
  },
);
