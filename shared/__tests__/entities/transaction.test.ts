import { assert } from "@std/assert";
import { Transaction } from "../../entities/transaction.ts";

Deno.test("Transaction entity", () => {
  // TODO: Test transaction entity validation and methods
});

Deno.test("Transaction - can be created with required fields", () => {
  const transaction = Transaction.create({
    merchantId: "550e8400-e29b-41d4-a716-446655440000",
    description: "Coffee at Starbucks",
    amountCents: 550,
    type: "expense",
    transactionDate: new Date("2025-10-21"),
    createdById: "550e8400-e29b-41d4-a716-446655440001",
  });

  assert(transaction.id.length > 0);
  assert(transaction.merchantId === "550e8400-e29b-41d4-a716-446655440000");
  assert(transaction.description === "Coffee at Starbucks");
  assert(transaction.amountCents === 550);
  assert(transaction.type === "expense");
  assert(transaction.transactionDate instanceof Date);
  assert(transaction.createdById === "550e8400-e29b-41d4-a716-446655440001");
  assert(transaction.createdAt instanceof Date);
  assert(transaction.updatedAt instanceof Date);
});

Deno.test("Transaction - can be created with income type", () => {
  const transaction = Transaction.create({
    merchantId: "550e8400-e29b-41d4-a716-446655440000",
    description: "Salary deposit",
    amountCents: 500000,
    type: "income",
    transactionDate: new Date("2025-10-21"),
    createdById: "550e8400-e29b-41d4-a716-446655440001",
  });

  assert(transaction.type === "income");
  assert(transaction.amountCents === 500000);
});

Deno.test("Transaction - validates required fields", () => {
  try {
    Transaction.create({
      merchantId: "", // Invalid empty merchantId
      description: "Test transaction",
      amountCents: 100,
      type: "expense",
      transactionDate: new Date(),
      createdById: "550e8400-e29b-41d4-a716-446655440001",
    });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test("Transaction - validates amount is positive", () => {
  try {
    Transaction.create({
      merchantId: "550e8400-e29b-41d4-a716-446655440000",
      description: "Test transaction",
      amountCents: -100, // Invalid negative amount
      type: "expense",
      transactionDate: new Date(),
      createdById: "550e8400-e29b-41d4-a716-446655440001",
    });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test("Transaction - can be reconstructed from data", () => {
  const data = {
    id: "550e8400-e29b-41d4-a716-446655440002",
    merchantId: "550e8400-e29b-41d4-a716-446655440000",
    description: "Lunch at cafe",
    amountCents: 1250,
    type: "expense" as const,
    transactionDate: new Date("2025-10-21T12:00:00Z"),
    createdById: "550e8400-e29b-41d4-a716-446655440001",
    createdAt: new Date("2025-10-21T12:00:00Z"),
    updatedAt: new Date("2025-10-21T12:00:00Z"),
  };

  const transaction = Transaction.from(data);

  assert(transaction.id === data.id);
  assert(transaction.merchantId === data.merchantId);
  assert(transaction.description === data.description);
  assert(transaction.amountCents === data.amountCents);
  assert(transaction.type === data.type);
  assert(
    transaction.transactionDate.getTime() === data.transactionDate.getTime()
  );
  assert(transaction.createdById === data.createdById);
  assert(transaction.createdAt.getTime() === data.createdAt.getTime());
  assert(transaction.updatedAt.getTime() === data.updatedAt.getTime());
});

Deno.test("Transaction - toJSON returns correct data", () => {
  const transaction = Transaction.create({
    merchantId: "550e8400-e29b-41d4-a716-446655440000",
    description: "Test transaction",
    amountCents: 1000,
    type: "expense",
    transactionDate: new Date("2025-10-21"),
    createdById: "550e8400-e29b-41d4-a716-446655440001",
  });

  const json = transaction.toJSON();

  assert(typeof json.id === "string");
  assert(json.merchantId === "550e8400-e29b-41d4-a716-446655440000");
  assert(json.description === "Test transaction");
  assert(json.amountCents === 1000);
  assert(json.type === "expense");
  assert(json.transactionDate instanceof Date);
  assert(json.createdById === "550e8400-e29b-41d4-a716-446655440001");
  assert(json.createdAt instanceof Date);
  assert(json.updatedAt instanceof Date);
});
