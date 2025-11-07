import { assertEquals, assertThrows } from "@std/assert";
import { Card, type CardData } from "../../entities/card.ts";

Deno.test("Card - creates with all optional fields omitted", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);

  assertEquals(card.cardAccountId, data.cardAccountId);
  assertEquals(card.memberId, undefined);
  assertEquals(card.nickname, undefined);
  assertEquals(card.last4, undefined);
  assertEquals(card.isActive, true);
});

Deno.test("Card - creates with all fields present", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    memberId: "323e4567-e89b-12d3-a456-426614174000",
    nickname: "Andrew's Main Card",
    last4: "1234",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);

  assertEquals(card.cardAccountId, data.cardAccountId);
  assertEquals(card.memberId, data.memberId);
  assertEquals(card.nickname, "Andrew's Main Card");
  assertEquals(card.last4, "1234");
});

Deno.test("Card - creates with memberId only", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    memberId: "323e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);

  assertEquals(card.memberId, data.memberId);
  assertEquals(card.nickname, undefined);
  assertEquals(card.last4, undefined);
});

Deno.test("Card - creates with nickname only", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    nickname: "Main Card",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);

  assertEquals(card.nickname, "Main Card");
  assertEquals(card.memberId, undefined);
  assertEquals(card.last4, undefined);
});

Deno.test("Card - creates with last4 only", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    last4: "5678",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);

  assertEquals(card.last4, "5678");
  assertEquals(card.memberId, undefined);
  assertEquals(card.nickname, undefined);
});

Deno.test("Card - trims nickname whitespace", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    nickname: "  Main Card  ",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);

  assertEquals(card.nickname, "Main Card");
});

Deno.test("Card - throws error when cardAccountId is missing", () => {
  const data = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as Partial<CardData> as CardData;

  assertThrows(() => new Card(data));
});

Deno.test("Card - throws error when cardAccountId is invalid UUID", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "not-a-uuid",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assertThrows(() => new Card(data));
});

Deno.test("Card - throws error when memberId is invalid UUID", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    memberId: "not-a-uuid",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assertThrows(() => new Card(data));
});

Deno.test("Card - throws error when nickname is empty string", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    nickname: "",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assertThrows(() => new Card(data));
});

Deno.test("Card - throws error when nickname exceeds 100 characters", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    nickname: "a".repeat(101),
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assertThrows(() => new Card(data));
});

Deno.test("Card - accepts nickname at 100 characters", () => {
  const nickname = "a".repeat(100);
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    nickname,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);
  assertEquals(card.nickname, nickname);
});

Deno.test("Card - throws error when last4 is not 4 characters", () => {
  const data1: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    last4: "123",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assertThrows(() => new Card(data1));

  const data2: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    last4: "12345",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assertThrows(() => new Card(data2));
});

Deno.test("Card - throws error when last4 contains non-digits", () => {
  const data1: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    last4: "abcd",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assertThrows(() => new Card(data1));

  const data2: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    last4: "12a4",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  assertThrows(() => new Card(data2));
});

Deno.test("Card - accepts valid last4", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    last4: "9876",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);
  assertEquals(card.last4, "9876");
});

Deno.test("Card - displayName with nickname and last4", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    nickname: "Main Card",
    last4: "1234",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);
  assertEquals(card.displayName, "Main Card (••1234)");
});

Deno.test("Card - displayName with nickname only", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    nickname: "Main Card",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);
  assertEquals(card.displayName, "Main Card");
});

Deno.test("Card - displayName with last4 only", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    last4: "1234",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);
  assertEquals(card.displayName, "Card ••1234");
});

Deno.test("Card - displayName with neither nickname nor last4", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);
  assertEquals(card.displayName, "Card");
});

Deno.test("Card - canDelete returns true (placeholder)", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);
  assertEquals(card.canDelete(), true);
});

Deno.test("Card - archive toggles isActive", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);
  assertEquals(card.isActive, true);

  card.archive();
  assertEquals(card.isActive, false);
});

Deno.test("Card - toJSON includes all fields with optionals", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    memberId: "323e4567-e89b-12d3-a456-426614174000",
    nickname: "Main Card",
    last4: "1234",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);
  const json = card.toJSON;

  assertEquals(json.id, data.id);
  assertEquals(json.cardAccountId, data.cardAccountId);
  assertEquals(json.memberId, data.memberId);
  assertEquals(json.nickname, "Main Card");
  assertEquals(json.last4, "1234");
  assertEquals(json.isActive, true);
});

Deno.test("Card - toJSON includes all fields without optionals", () => {
  const data: CardData = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = new Card(data);
  const json = card.toJSON;

  assertEquals(json.id, data.id);
  assertEquals(json.cardAccountId, data.cardAccountId);
  assertEquals(json.memberId, undefined);
  assertEquals(json.nickname, undefined);
  assertEquals(json.last4, undefined);
  assertEquals(json.isActive, true);
});

Deno.test("Card - parse reconstructs from valid data", () => {
  const data = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "223e4567-e89b-12d3-a456-426614174000",
    memberId: "323e4567-e89b-12d3-a456-426614174000",
    nickname: "Main Card",
    last4: "1234",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const card = Card.parse(data);

  assertEquals(card.cardAccountId, data.cardAccountId);
  assertEquals(card.memberId, data.memberId);
  assertEquals(card.nickname, "Main Card");
  assertEquals(card.last4, "1234");
});

Deno.test("Card - parse throws on invalid data", () => {
  const data = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    cardAccountId: "not-a-uuid",
    isActive: true,
  };

  assertThrows(() => Card.parse(data));
});
