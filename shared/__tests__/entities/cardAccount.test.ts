import { assertEquals, assertThrows } from "@std/assert";
import {
  CardAccount,
  type CardAccountData,
} from "../../entities/cardAccount.ts";

// ============================================================================
// Success Cases
// ============================================================================

Deno.test(
  "CardAccount - creates valid instance with all required fields",
  () => {
    const data = {
      name: "Chase Sapphire",
      issuer: "Chase",
      last4: "1234",
      billingCycle: 15,
      ownerId: crypto.randomUUID(),
      isActive: true,
    };

    const cardAccount = new CardAccount(data);

    assertEquals(cardAccount.name, "Chase Sapphire");
    assertEquals(cardAccount.issuer, "Chase");
    assertEquals(cardAccount.last4, "1234");
    assertEquals(cardAccount.billingCycle, 15);
    assertEquals(cardAccount.creditLimitCents, undefined);
    assertEquals(cardAccount.ownerId, data.ownerId);
    assertEquals(cardAccount.isActive, true);
  }
);

Deno.test(
  "CardAccount - creates valid instance with optional creditLimitCents",
  () => {
    const data = {
      name: "Amex Platinum",
      issuer: "American Express",
      last4: "9876",
      billingCycle: 1,
      creditLimitCents: 1000000, // $10,000
      ownerId: crypto.randomUUID(),
      isActive: true,
    };

    const cardAccount = new CardAccount(data);

    assertEquals(cardAccount.creditLimitCents, 1000000);
  }
);

Deno.test("CardAccount - trims name and issuer whitespace", () => {
  const data = {
    name: "  Visa Gold  ",
    issuer: "  Visa  ",
    last4: "5555",
    billingCycle: 20,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  const cardAccount = new CardAccount(data);

  assertEquals(cardAccount.name, "Visa Gold");
  assertEquals(cardAccount.issuer, "Visa");
});

// ============================================================================
// Validation - Required Fields
// ============================================================================

Deno.test("CardAccount - throws on missing name", () => {
  const data: Partial<CardAccountData> = {
    // name: missing
    issuer: "Test",
    last4: "1234",
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data as CardAccountData));
});

Deno.test("CardAccount - throws on missing issuer", () => {
  const data: Partial<CardAccountData> = {
    name: "Test Card",
    // issuer: missing
    last4: "1234",
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data as CardAccountData));
});

Deno.test("CardAccount - throws on missing last4", () => {
  const data: Partial<CardAccountData> = {
    name: "Test Card",
    issuer: "Test",
    // last4: missing
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data as CardAccountData));
});

Deno.test("CardAccount - throws on missing billingCycle", () => {
  const data: Partial<CardAccountData> = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    // billingCycle: missing
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data as CardAccountData));
});

Deno.test("CardAccount - throws on missing ownerId", () => {
  const data: Partial<CardAccountData> = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    billingCycle: 15,
    // ownerId: missing
    isActive: true,
  };

  assertThrows(() => new CardAccount(data as CardAccountData));
});

// ============================================================================
// Validation - Field Constraints
// ============================================================================

Deno.test("CardAccount - throws on empty name", () => {
  const data = {
    name: "",
    issuer: "Test",
    last4: "1234",
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

Deno.test("CardAccount - throws on name exceeding 255 chars", () => {
  const data = {
    name: "a".repeat(256),
    issuer: "Test",
    last4: "1234",
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

Deno.test("CardAccount - throws on empty issuer", () => {
  const data = {
    name: "Test Card",
    issuer: "",
    last4: "1234",
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

Deno.test("CardAccount - throws on issuer exceeding 255 chars", () => {
  const data = {
    name: "Test Card",
    issuer: "a".repeat(256),
    last4: "1234",
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

// ============================================================================
// Validation - last4 Format
// ============================================================================

Deno.test("CardAccount - throws on last4 less than 4 digits", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "123", // Only 3 digits
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

Deno.test("CardAccount - throws on last4 more than 4 digits", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "12345", // 5 digits
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

Deno.test("CardAccount - throws on last4 with non-digit characters", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "abcd",
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

Deno.test("CardAccount - throws on last4 with mixed alphanumeric", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "12ab",
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

// ============================================================================
// Validation - billingCycle Range
// ============================================================================

Deno.test("CardAccount - accepts billingCycle edge case 1", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    billingCycle: 1,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  const cardAccount = new CardAccount(data);
  assertEquals(cardAccount.billingCycle, 1);
});

Deno.test("CardAccount - accepts billingCycle edge case 31", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    billingCycle: 31,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  const cardAccount = new CardAccount(data);
  assertEquals(cardAccount.billingCycle, 31);
});

Deno.test("CardAccount - throws on billingCycle 0", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    billingCycle: 0,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

Deno.test("CardAccount - throws on billingCycle 32", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    billingCycle: 32,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

Deno.test("CardAccount - throws on negative billingCycle", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    billingCycle: -5,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

Deno.test("CardAccount - throws on non-integer billingCycle", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    billingCycle: 15.5,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

// ============================================================================
// Validation - creditLimitCents
// ============================================================================

Deno.test("CardAccount - throws on zero creditLimitCents", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    billingCycle: 15,
    creditLimitCents: 0,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

Deno.test("CardAccount - throws on negative creditLimitCents", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    billingCycle: 15,
    creditLimitCents: -1000,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

Deno.test("CardAccount - throws on non-integer creditLimitCents", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    billingCycle: 15,
    creditLimitCents: 100.5,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

// ============================================================================
// Validation - ownerId UUID
// ============================================================================

Deno.test("CardAccount - throws on invalid ownerId UUID", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    billingCycle: 15,
    ownerId: "not-a-uuid",
    isActive: true,
  };

  assertThrows(() => new CardAccount(data));
});

// ============================================================================
// Business Logic Methods
// ============================================================================

Deno.test("CardAccount - archive() toggles isActive to false", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  const cardAccount = new CardAccount(data);
  assertEquals(cardAccount.isActive, true);

  cardAccount.archive();
  assertEquals(cardAccount.isActive, false);
});

Deno.test("CardAccount - canDelete() returns true (placeholder)", () => {
  const data = {
    name: "Test Card",
    issuer: "Test",
    last4: "1234",
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  const cardAccount = new CardAccount(data);
  assertEquals(cardAccount.canDelete(), true);
});

// ============================================================================
// Serialization
// ============================================================================

Deno.test(
  "CardAccount - toJSON returns correct structure without creditLimitCents",
  () => {
    const ownerId = crypto.randomUUID();
    const data = {
      name: "Test Card",
      issuer: "Test",
      last4: "1234",
      billingCycle: 15,
      ownerId,
      isActive: true,
    };

    const cardAccount = new CardAccount(data);
    const json = cardAccount.toJSON;

    assertEquals(json.name, "Test Card");
    assertEquals(json.issuer, "Test");
    assertEquals(json.last4, "1234");
    assertEquals(json.billingCycle, 15);
    assertEquals(json.creditLimitCents, undefined);
    assertEquals(json.ownerId, ownerId);
    assertEquals(json.isActive, true);
    assertEquals(typeof json.id, "string");
    assertEquals(typeof json.createdAt, "object"); // Date
    assertEquals(typeof json.updatedAt, "object"); // Date
  }
);

Deno.test(
  "CardAccount - toJSON returns correct structure with creditLimitCents",
  () => {
    const ownerId = crypto.randomUUID();
    const data = {
      name: "Premium Card",
      issuer: "Premium Bank",
      last4: "9999",
      billingCycle: 28,
      creditLimitCents: 500000,
      ownerId,
      isActive: true,
    };

    const cardAccount = new CardAccount(data);
    const json = cardAccount.toJSON;

    assertEquals(json.creditLimitCents, 500000);
  }
);

// ============================================================================
// Static parse() Method
// ============================================================================

Deno.test("CardAccount - parse() reconstructs from valid data", () => {
  const ownerId = crypto.randomUUID();
  const data = {
    id: crypto.randomUUID(),
    name: "Reconstructed Card",
    issuer: "Bank",
    last4: "8888",
    billingCycle: 10,
    creditLimitCents: 300000,
    ownerId,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const cardAccount = CardAccount.parse(data);

  assertEquals(cardAccount.name, "Reconstructed Card");
  assertEquals(cardAccount.issuer, "Bank");
  assertEquals(cardAccount.last4, "8888");
  assertEquals(cardAccount.billingCycle, 10);
  assertEquals(cardAccount.creditLimitCents, 300000);
  assertEquals(cardAccount.ownerId, ownerId);
});

Deno.test("CardAccount - parse() throws on invalid data", () => {
  const data = {
    name: "Invalid",
    issuer: "Test",
    last4: "12", // Invalid - not 4 digits
    billingCycle: 15,
    ownerId: crypto.randomUUID(),
    isActive: true,
  };

  assertThrows(() => CardAccount.parse(data));
});
