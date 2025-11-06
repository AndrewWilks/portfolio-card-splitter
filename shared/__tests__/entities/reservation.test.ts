import { assert } from "@std/assert";
import { Reservation } from "../../entities/reservation.ts";
import { Cents } from "@shared/types";

Deno.test("Reservation - creates reservation with required fields", () => {
  const reservation = Reservation.create({
    potId: "550e8400-e29b-41d4-a716-446655440000",
    transactionId: "550e8400-e29b-41d4-a716-446655440001",
    memberId: "550e8400-e29b-41d4-a716-446655440002",
    amountCents: 5000 as Cents,
  });

  assert(typeof reservation.id === "string");
  assert(reservation.potId === "550e8400-e29b-41d4-a716-446655440000");
  assert(reservation.transactionId === "550e8400-e29b-41d4-a716-446655440001");
  assert(reservation.memberId === "550e8400-e29b-41d4-a716-446655440002");
  assert(reservation.amountCents === 5000);
  assert(reservation.allocationId === undefined);
  assert(reservation.createdAt instanceof Date);
});

Deno.test("Reservation - creates reservation with allocation link", () => {
  const reservation = Reservation.create({
    potId: "550e8400-e29b-41d4-a716-446655440000",
    transactionId: "550e8400-e29b-41d4-a716-446655440001",
    allocationId: "550e8400-e29b-41d4-a716-446655440003",
    memberId: "550e8400-e29b-41d4-a716-446655440002",
    amountCents: 7500 as Cents,
  });

  assert(reservation.allocationId === "550e8400-e29b-41d4-a716-446655440003");
  assert(reservation.memberId === "550e8400-e29b-41d4-a716-446655440002");
  assert(reservation.amountCents === 7500);
});

Deno.test("Reservation - validates amount is not negative", () => {
  try {
    Reservation.create({
      potId: "550e8400-e29b-41d4-a716-446655440000",
      transactionId: "550e8400-e29b-41d4-a716-446655440001",
      memberId: "550e8400-e29b-41d4-a716-446655440002",
      amountCents: -100 as Cents,
    });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test("Reservation - validates required UUID fields", () => {
  try {
    Reservation.create({
      potId: "invalid-uuid",
      transactionId: "550e8400-e29b-41d4-a716-446655440001",
      memberId: "550e8400-e29b-41d4-a716-446655440002",
      amountCents: 1000 as Cents,
    });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test("Reservation - can be reconstructed from data", () => {
  const data = {
    id: "550e8400-e29b-41d4-a716-446655440004",
    potId: "550e8400-e29b-41d4-a716-446655440000",
    transactionId: "550e8400-e29b-41d4-a716-446655440001",
    allocationId: "550e8400-e29b-41d4-a716-446655440003",
    memberId: "550e8400-e29b-41d4-a716-446655440002",
    amountCents: 2500 as Cents,
    createdAt: new Date("2025-11-07T12:00:00Z"),
    updatedAt: new Date("2025-11-07T12:00:00Z"),
  };

  const reservation = new Reservation(data);

  assert(reservation.id === data.id);
  assert(reservation.potId === data.potId);
  assert(reservation.transactionId === data.transactionId);
  assert(reservation.allocationId === data.allocationId);
  assert(reservation.memberId === data.memberId);
  assert(reservation.amountCents === data.amountCents);
  assert(reservation.createdAt.getTime() === data.createdAt.getTime());
  assert(reservation.updatedAt.getTime() === data.updatedAt.getTime());
});

Deno.test("Reservation - toJSON returns correct data", () => {
  const reservation = Reservation.create({
    potId: "550e8400-e29b-41d4-a716-446655440000",
    transactionId: "550e8400-e29b-41d4-a716-446655440001",
    allocationId: "550e8400-e29b-41d4-a716-446655440003",
    memberId: "550e8400-e29b-41d4-a716-446655440002",
    amountCents: 3000 as Cents,
  });

  const json = reservation.toJSON;

  assert(typeof json.id === "string");
  assert(json.potId === "550e8400-e29b-41d4-a716-446655440000");
  assert(json.transactionId === "550e8400-e29b-41d4-a716-446655440001");
  assert(json.allocationId === "550e8400-e29b-41d4-a716-446655440003");
  assert(json.memberId === "550e8400-e29b-41d4-a716-446655440002");
  assert(json.amountCents === 3000);
  assert(json.createdAt instanceof Date);
  assert(json.updatedAt instanceof Date);
});
