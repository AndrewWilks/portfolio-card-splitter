import { assert } from "@std/assert";
import { Allocation } from "../../entities/allocation.ts";
import { Cents, basisPoints } from "@shared/types";

Deno.test("Allocation entity", () => {
  // TODO: Test allocation entity validation and methods
});

Deno.test("Allocation - can be created with basisPoints rule", () => {
  const allocation = Allocation.create({
    transactionId: "550e8400-e29b-41d4-a716-446655440000",
    memberId: "550e8400-e29b-41d4-a716-446655440001",
    rule: Allocation.Rules.basisPoints,
    basisPoints: 5000 as basisPoints, // 50% in basis points
  });

  assert(allocation.id.length > 0);
  assert(allocation.transactionId === "550e8400-e29b-41d4-a716-446655440000");
  assert(allocation.memberId === "550e8400-e29b-41d4-a716-446655440001");
  assert(allocation.rule === Allocation.Rules.basisPoints);
  assert(allocation.basisPoints === 5000);
  // Test calculation - 50% of 10000 = 5000
  assert(allocation.calculateAmount(10000 as Cents) === 5000);
  assert(allocation.createdAt instanceof Date);
  assert(allocation.updatedAt instanceof Date);
});

Deno.test("Allocation - can be created with fixed amount rule", () => {
  const allocation = Allocation.create({
    transactionId: "550e8400-e29b-41d4-a716-446655440000",
    memberId: "550e8400-e29b-41d4-a716-446655440001",
    rule: Allocation.Rules.FIXED_AMOUNT,
    amountCents: 2500 as Cents, // $25.00
  });

  assert(allocation.rule === Allocation.Rules.FIXED_AMOUNT);
  assert(allocation.amountCents === 2500);
  assert(allocation.basisPoints === 0); // Default when not provided
  // For fixed amount, calculate returns the fixed amount regardless of transaction amount
  assert(allocation.calculateAmount(10000 as Cents) === 2500);
  assert(allocation.calculateAmount(5000 as Cents) === 2500);
});

Deno.test("Allocation - validates basisPoints range", () => {
  try {
    Allocation.create({
      transactionId: "550e8400-e29b-41d4-a716-446655440000",
      memberId: "550e8400-e29b-41d4-a716-446655440001",
      rule: Allocation.Rules.basisPoints,
      basisPoints: 15000 as basisPoints, // 150% - invalid
    });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test(
  "Allocation - validates basisPoints is required for basisPoints rule",
  () => {
    try {
      Allocation.create({
        transactionId: "550e8400-e29b-41d4-a716-446655440000",
        memberId: "550e8400-e29b-41d4-a716-446655440001",
        rule: Allocation.Rules.basisPoints,
        // Missing basisPoints
      });
      assert(false, "Should have thrown validation error");
    } catch (error) {
      assert(error instanceof Error);
    }
  }
);

Deno.test(
  "Allocation - validates amount is required for fixed amount rule",
  () => {
    try {
      Allocation.create({
        transactionId: "550e8400-e29b-41d4-a716-446655440000",
        memberId: "550e8400-e29b-41d4-a716-446655440001",
        rule: Allocation.Rules.FIXED_AMOUNT,
        // Missing amountCents
      });
      assert(false, "Should have thrown validation error");
    } catch (error) {
      assert(error instanceof Error);
    }
  }
);

Deno.test("Allocation - can be reconstructed from data", () => {
  const data = {
    id: "550e8400-e29b-41d4-a716-446655440002",
    transactionId: "550e8400-e29b-41d4-a716-446655440000",
    memberId: "550e8400-e29b-41d4-a716-446655440001",
    rule: Allocation.Rules.basisPoints,
    basisPoints: 7500 as basisPoints, // 75%
    createdAt: new Date("2025-10-21T12:00:00Z"),
    updatedAt: new Date("2025-10-21T12:00:00Z"),
  };

  const allocation = new Allocation(data);

  assert(allocation.id === data.id);
  assert(allocation.transactionId === data.transactionId);
  assert(allocation.memberId === data.memberId);
  assert(allocation.rule === data.rule);
  assert(allocation.basisPoints === data.basisPoints);
  assert(allocation.createdAt.getTime() === data.createdAt.getTime());
  assert(allocation.updatedAt.getTime() === data.updatedAt.getTime());

  // Test calculation - 75% of 10000 = 7500
  assert(allocation.calculateAmount(10000 as Cents) === 7500);
});

Deno.test("Allocation - toJSON returns correct data", () => {
  const allocation = Allocation.create({
    transactionId: "550e8400-e29b-41d4-a716-446655440000",
    memberId: "550e8400-e29b-41d4-a716-446655440001",
    rule: Allocation.Rules.FIXED_AMOUNT,
    amountCents: 1000 as Cents,
  });

  const json = allocation.toJSON;

  assert(typeof json.id === "string");
  assert(json.transactionId === "550e8400-e29b-41d4-a716-446655440000");
  assert(json.memberId === "550e8400-e29b-41d4-a716-446655440001");
  assert(json.rule === Allocation.Rules.FIXED_AMOUNT);
  assert(json.amountCents === 1000);
  assert(json.createdAt instanceof Date);
  assert(json.updatedAt instanceof Date);
});
