import { assertEquals } from "@std/assert";
import { Payment } from "../../entities/payment.ts";
import type { Cents } from "@shared/types";

Deno.test("Payment entity - constructor with all required fields", () => {
  const now = new Date();
  const payment = new Payment({
    id: "payment-123",
    createdAt: now,
    updatedAt: now,
    paidOn: now,
    potId: "pot-1",
    transactionId: "transaction-1",
    amountCents: 10000 as Cents,
    note: "Test payment",
    needsReconciliation: false,
    createdById: "user-1",
  });

  assertEquals(payment.paidOn, now);
  assertEquals(payment.potId, "pot-1");
  assertEquals(payment.transactionId, "transaction-1");
  assertEquals(payment.amountCents, 10000);
  assertEquals(payment.note, "Test payment");
  assertEquals(payment.reservationId, undefined);
  assertEquals(payment.needsReconciliation, false);
  assertEquals(payment.createdById, "user-1");
});

Deno.test("Payment entity - constructor with optional reservationId", () => {
  const now = new Date();
  const payment = new Payment({
    id: "payment-123",
    createdAt: now,
    updatedAt: now,
    paidOn: now,
    potId: "pot-1",
    transactionId: "transaction-1",
    reservationId: "reservation-1",
    amountCents: 5000 as Cents,
    needsReconciliation: false,
    createdById: "user-1",
  });

  assertEquals(payment.reservationId, "reservation-1");
  assertEquals(payment.note, undefined);
  assertEquals(payment.needsReconciliation, false);
});

Deno.test("Payment entity - constructor without optional note", () => {
  const now = new Date();
  const payment = new Payment({
    id: "payment-123",
    createdAt: now,
    updatedAt: now,
    paidOn: now,
    potId: "pot-1",
    transactionId: "transaction-1",
    amountCents: 7500 as Cents,
    needsReconciliation: true,
    createdById: "user-1",
  });

  assertEquals(payment.note, undefined);
  assertEquals(payment.paidOn, now);
  assertEquals(payment.potId, "pot-1");
  assertEquals(payment.transactionId, "transaction-1");
  assertEquals(payment.amountCents, 7500);
  assertEquals(payment.needsReconciliation, true);
});

Deno.test("Payment entity - toJSON includes all fields", () => {
  const now = new Date();
  const payment = new Payment({
    id: "payment-123",
    createdAt: now,
    updatedAt: now,
    paidOn: now,
    potId: "pot-1",
    transactionId: "transaction-1",
    reservationId: "reservation-1",
    amountCents: 10000 as Cents,
    note: "Test payment",
    needsReconciliation: false,
    createdById: "user-1",
  });

  const json = payment.toJSON;

  assertEquals(json.id, "payment-123");
  assertEquals(json.paidOn, now);
  assertEquals(json.potId, "pot-1");
  assertEquals(json.transactionId, "transaction-1");
  assertEquals(json.reservationId, "reservation-1");
  assertEquals(json.amountCents, 10000);
  assertEquals(json.note, "Test payment");
  assertEquals(json.needsReconciliation, false);
  assertEquals(json.createdById, "user-1");
});
