import { assert } from "@std/assert";
import { Pot } from "../../entities/pot.ts";

Deno.test("Pot entity", () => {
  // TODO: Test pot entity validation and methods
});

Deno.test("Pot - can be created with required fields", () => {
  const pot = Pot.create({
    name: "Credit Card Payback",
    type: "solo",
    ownerId: "550e8400-e29b-41d4-a716-446655440000",
    balanceCents: 0,
    isActive: true,
  });

  assert(pot.id.length > 0);
  assert(pot.name === "Credit Card Payback");
  assert(pot.type === "solo");
  assert(pot.ownerId === "550e8400-e29b-41d4-a716-446655440000");
  assert(pot.balanceCents === 0);
  assert(pot.isActive === true);
  assert(pot.createdAt instanceof Date);
  assert(pot.updatedAt instanceof Date);
});

Deno.test("Pot - can be created with optional fields", () => {
  const pot = Pot.create({
    name: "Shared Savings",
    description: "For emergency fund",
    type: "shared",
    location: "Bank Account",
    ownerId: "550e8400-e29b-41d4-a716-446655440000",
    balanceCents: 50000,
    isActive: true,
  });

  assert(pot.description === "For emergency fund");
  assert(pot.type === "shared");
  assert(pot.location === "Bank Account");
  assert(pot.balanceCents === 50000);
});

Deno.test("Pot - validates required fields", () => {
  try {
    Pot.create({
      name: "", // Invalid empty name
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
      balanceCents: 0,
      isActive: true,
    });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test("Pot - validates balance is non-negative", () => {
  try {
    Pot.create({
      name: "Test Pot",
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
      balanceCents: -100, // Invalid negative balance
      isActive: true,
    });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test("Pot - validates name length", () => {
  try {
    Pot.create({
      name: "a".repeat(101), // Name too long
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
      balanceCents: 0,
      isActive: true,
    });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test("Pot - validates description length", () => {
  try {
    Pot.create({
      name: "Test Pot",
      description: "a".repeat(501), // Description too long
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
      balanceCents: 0,
      isActive: true,
    });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test("Pot - validates location length", () => {
  try {
    Pot.create({
      name: "Test Pot",
      location: "a".repeat(201), // Location too long
      type: "solo",
      ownerId: "550e8400-e29b-41d4-a716-446655440000",
      balanceCents: 0,
      isActive: true,
    });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test("Pot - can be reconstructed from data", () => {
  const data = {
    id: "550e8400-e29b-41d4-a716-446655440002",
    name: "Reconstructed Pot",
    description: "Test description",
    type: "shared" as const,
    location: "Test location",
    ownerId: "550e8400-e29b-41d4-a716-446655440000",
    balanceCents: 10000,
    isActive: true,
    createdAt: new Date("2025-10-21T12:00:00Z"),
    updatedAt: new Date("2025-10-21T12:00:00Z"),
  };

  const pot = Pot.from(data);

  assert(pot.id === data.id);
  assert(pot.name === data.name);
  assert(pot.description === data.description);
  assert(pot.type === data.type);
  assert(pot.location === data.location);
  assert(pot.ownerId === data.ownerId);
  assert(pot.balanceCents === data.balanceCents);
  assert(pot.isActive === data.isActive);
  assert(pot.createdAt.getTime() === data.createdAt.getTime());
  assert(pot.updatedAt.getTime() === data.updatedAt.getTime());
});

Deno.test("Pot - toJSON returns correct data", () => {
  const pot = Pot.create({
    name: "JSON Test Pot",
    type: "solo",
    ownerId: "550e8400-e29b-41d4-a716-446655440000",
    balanceCents: 5000,
    isActive: true,
  });

  const json = pot.toJSON();

  assert(json.id === pot.id);
  assert(json.name === pot.name);
  assert(json.type === pot.type);
  assert(json.ownerId === pot.ownerId);
  assert(json.balanceCents === pot.balanceCents);
  assert(json.isActive === pot.isActive);
  assert(json.createdAt instanceof Date);
  assert(json.updatedAt instanceof Date);
});
