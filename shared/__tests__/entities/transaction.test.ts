import { assertEquals, assertThrows } from "@std/assert";
import {
  Transaction,
  TransactionType,
  type TransactionData,
} from "../../entities/transaction.ts";
import type { Cents } from "../../types.ts";

Deno.test(
  "Transaction - creates with required fields including cardAccountId",
  () => {
    const data: TransactionData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
      merchantId: "323e4567-e89b-12d3-a456-426614174000",
      description: "Coffee at Starbucks",
      amountCents: 550 as Cents,
      type: TransactionType.EXPENSE,
      transactionDate: new Date("2025-10-21"),
      createdById: "423e4567-e89b-12d3-a456-426614174000",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const transaction = new Transaction(data);

    assertEquals(transaction.cardAccountId, data.cardAccountId);
    assertEquals(transaction.cardId, undefined);
    assertEquals(transaction.merchantId, data.merchantId);
    assertEquals(transaction.description, "Coffee at Starbucks");
    assertEquals(transaction.amountCents, 550 as Cents);
    assertEquals(transaction.type, TransactionType.EXPENSE);
    assertEquals(transaction.createdById, data.createdById);
  }
);

Deno.test("Transaction - creates with cardAccountId and cardId", () => {
  const data: TransactionData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    cardId: "523e4567-e89b-12d3-a456-426614174000",
    merchantId: "323e4567-e89b-12d3-a456-426614174000",
    description: "Lunch at cafe",
    amountCents: 1250 as Cents,
    type: TransactionType.EXPENSE,
    transactionDate: new Date("2025-10-21"),
    createdById: "423e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const transaction = new Transaction(data);

  assertEquals(transaction.cardAccountId, data.cardAccountId);
  assertEquals(transaction.cardId, data.cardId);
});

Deno.test("Transaction - creates with income type", () => {
  const data: TransactionData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    merchantId: "323e4567-e89b-12d3-a456-426614174000",
    description: "Salary deposit",
    amountCents: 500000 as Cents,
    type: TransactionType.INCOME,
    transactionDate: new Date("2025-10-21"),
    createdById: "423e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const transaction = new Transaction(data);

  assertEquals(transaction.type, TransactionType.INCOME);
  assertEquals(transaction.amountCents, 500000 as Cents);
});

Deno.test("Transaction - throws error when cardAccountId is missing", () => {
  const data = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    merchantId: "323e4567-e89b-12d3-a456-426614174000",
    description: "Test transaction",
    amountCents: 100 as Cents,
    type: TransactionType.EXPENSE,
    transactionDate: new Date(),
    createdById: "423e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Partial<TransactionData> as TransactionData;

  assertThrows(() => new Transaction(data));
});

Deno.test(
  "Transaction - throws error when cardAccountId is invalid UUID",
  () => {
    const data: TransactionData = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      cardAccountId: "not-a-uuid",
      merchantId: "323e4567-e89b-12d3-a456-426614174000",
      description: "Test transaction",
      amountCents: 100 as Cents,
      type: TransactionType.EXPENSE,
      transactionDate: new Date(),
      createdById: "423e4567-e89b-12d3-a456-426614174000",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    assertThrows(() => new Transaction(data));
  }
);

Deno.test("Transaction - throws error when cardId is invalid UUID", () => {
  const data: TransactionData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    cardId: "not-a-uuid",
    merchantId: "323e4567-e89b-12d3-a456-426614174000",
    description: "Test transaction",
    amountCents: 100 as Cents,
    type: TransactionType.EXPENSE,
    transactionDate: new Date(),
    createdById: "423e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assertThrows(() => new Transaction(data));
});

Deno.test("Transaction - throws error when merchantId is invalid", () => {
  const data: TransactionData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    merchantId: "invalid",
    description: "Test transaction",
    amountCents: 100 as Cents,
    type: TransactionType.EXPENSE,
    transactionDate: new Date(),
    createdById: "423e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assertThrows(() => new Transaction(data));
});

Deno.test("Transaction - throws error when description is empty", () => {
  const data: TransactionData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    merchantId: "323e4567-e89b-12d3-a456-426614174000",
    description: "",
    amountCents: 100 as Cents,
    type: TransactionType.EXPENSE,
    transactionDate: new Date(),
    createdById: "423e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assertThrows(() => new Transaction(data));
});

Deno.test("Transaction - throws error when amountCents is negative", () => {
  const data: TransactionData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    merchantId: "323e4567-e89b-12d3-a456-426614174000",
    description: "Test transaction",
    amountCents: -100 as Cents,
    type: TransactionType.EXPENSE,
    transactionDate: new Date(),
    createdById: "423e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assertThrows(() => new Transaction(data));
});

Deno.test("Transaction - toJSON includes cardAccountId and cardId", () => {
  const data: TransactionData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    cardId: "523e4567-e89b-12d3-a456-426614174000",
    merchantId: "323e4567-e89b-12d3-a456-426614174000",
    description: "Test transaction",
    amountCents: 1000 as Cents,
    type: TransactionType.EXPENSE,
    transactionDate: new Date("2025-10-21"),
    createdById: "423e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const transaction = new Transaction(data);
  const json = transaction.toJSON;

  assertEquals(json.cardAccountId, data.cardAccountId);
  assertEquals(json.cardId, data.cardId);
  assertEquals(json.merchantId, data.merchantId);
  assertEquals(json.description, "Test transaction");
  assertEquals(json.amountCents, 1000 as Cents);
  assertEquals(json.type, TransactionType.EXPENSE);
  assertEquals(json.createdById, data.createdById);
});

Deno.test("Transaction - toJSON without cardId", () => {
  const data: TransactionData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    merchantId: "323e4567-e89b-12d3-a456-426614174000",
    description: "Test transaction",
    amountCents: 1000 as Cents,
    type: TransactionType.EXPENSE,
    transactionDate: new Date("2025-10-21"),
    createdById: "423e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const transaction = new Transaction(data);
  const json = transaction.toJSON;

  assertEquals(json.cardAccountId, data.cardAccountId);
  assertEquals(json.cardId, undefined);
});

Deno.test("Transaction - parse reconstructs from valid data", () => {
  const data = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    cardId: "523e4567-e89b-12d3-a456-426614174000",
    merchantId: "323e4567-e89b-12d3-a456-426614174000",
    description: "Test transaction",
    amountCents: 1000 as Cents,
    type: TransactionType.EXPENSE,
    transactionDate: new Date("2025-10-21"),
    createdById: "423e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const transaction = Transaction.parse(data);

  assertEquals(transaction.cardAccountId, data.cardAccountId);
  assertEquals(transaction.cardId, data.cardId);
  assertEquals(transaction.merchantId, data.merchantId);
});

Deno.test("Transaction - parse throws on invalid data", () => {
  const data = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "not-a-uuid",
    merchantId: "323e4567-e89b-12d3-a456-426614174000",
    description: "Test",
    amountCents: 100 as Cents,
    type: TransactionType.EXPENSE,
    transactionDate: new Date(),
    createdById: "423e4567-e89b-12d3-a456-426614174000",
  };

  assertThrows(() => Transaction.parse(data));
});
