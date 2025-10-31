import { assert } from "@std/assert";
import { Allocation } from "../../entities/allocation.ts";

Deno.test("Allocation entity", () => {
  // TODO: Test allocation entity validation and methods
});

Deno.test("Allocation - can be created with basisPoints rule", () => {
  const allocation = Allocation.create({
    transactionId: "550e8400-e29b-41d4-a716-446655440000",
    memberId: "550e8400-e29b-41d4-a716-446655440001",
    rule: "basisPoints",
    basisPoints: 5000, // 50% in basis points
  });

  assert(allocation.id.length > 0);
  assert(allocation.transactionId === "550e8400-e29b-41d4-a716-446655440000");
  assert(allocation.memberId === "550e8400-e29b-41d4-a716-446655440001");
  assert(allocation.rule === "basisPoints");
  assert(allocation.basisPoints === 5000);
  assert(allocation.amountCents === undefined);
  assert(allocation.calculatedAmountCents === 0); // Will be calculated later
  assert(allocation.createdAt instanceof Date);
  assert(allocation.updatedAt instanceof Date);
});

Deno.test("Allocation - can be created with fixed amount rule", () => {
  const allocation = Allocation.create({
    transactionId: "550e8400-e29b-41d4-a716-446655440000",
    memberId: "550e8400-e29b-41d4-a716-446655440001",
    rule: "fixed_amount",
    amountCents: 2500, // $25.00
  });

  assert(allocation.rule === "fixed_amount");
  assert(allocation.amountCents === 2500);
  assert(allocation.basisPoints === undefined);
  assert(allocation.calculatedAmountCents === 2500); // For fixed amount, calculated = amount
});

Deno.test("Allocation - validates basisPoints range", () => {
  try {
    Allocation.create({
      transactionId: "550e8400-e29b-41d4-a716-446655440000",
      memberId: "550e8400-e29b-41d4-a716-446655440001",
      rule: "basisPoints",
      basisPoints: 15000, // 150% - invalid
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
        rule: "basisPoints",
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
        rule: "fixed_amount",
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
    rule: "basisPoints" as const,
    basisPoints: 7500, // 75%
    amountCents: undefined,
    calculatedAmountCents: 3750, // Will be calculated based on transaction amount
    createdAt: new Date("2025-10-21T12:00:00Z"),
    updatedAt: new Date("2025-10-21T12:00:00Z"),
  };

  const allocation = Allocation.from(data);

  assert(allocation.id === data.id);
  assert(allocation.transactionId === data.transactionId);
  assert(allocation.memberId === data.memberId);
  assert(allocation.rule === data.rule);
  assert(allocation.basisPoints === data.basisPoints);
  assert(allocation.amountCents === data.amountCents);
  assert(allocation.calculatedAmountCents === data.calculatedAmountCents);
  assert(allocation.createdAt.getTime() === data.createdAt.getTime());
  assert(allocation.updatedAt.getTime() === data.updatedAt.getTime());
});

Deno.test("Allocation - toJSON returns correct data", () => {
  const allocation = Allocation.create({
    transactionId: "550e8400-e29b-41d4-a716-446655440000",
    memberId: "550e8400-e29b-41d4-a716-446655440001",
    rule: "fixed_amount",
    amountCents: 1000,
  });

  const json = allocation.toJSON();

  assert(typeof json.id === "string");
  assert(json.transactionId === "550e8400-e29b-41d4-a716-446655440000");
  assert(json.memberId === "550e8400-e29b-41d4-a716-446655440001");
  assert(json.rule === "fixed_amount");
  assert(json.amountCents === 1000);
  assert(json.calculatedAmountCents === 1000);
  assert(json.createdAt instanceof Date);
  assert(json.updatedAt instanceof Date);
});
