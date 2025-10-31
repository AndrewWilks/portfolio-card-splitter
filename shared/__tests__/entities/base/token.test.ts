import { assertEquals } from "jsr:@std/assert";
import { Token } from "@shared/entities";

Deno.test("Token constructor", () => {
  const expiresAt = new Date("2026-01-01");
  const token = new Token({ expiresAt });
  assertEquals(token.id.length, 36);
  assertEquals(token.createdAt instanceof Date, true);
  assertEquals(token.updatedAt instanceof Date, true);
  assertEquals(token.isExpired(), false);
  assertEquals(token.isUsed(), false);
  assertEquals(token.isValid(), true);
});

Deno.test("Token.create with default expiration", () => {
  const token = Token.create({});
  assertEquals(token.isExpired(), false);
  assertEquals(token.isUsed(), false);
  assertEquals(token.isValid(), true);
});

Deno.test("Token.create with custom expiration", () => {
  const token = Token.create({ expirationHours: 2 });
  assertEquals(token.isExpired(), false);
  assertEquals(token.isUsed(), false);
  assertEquals(token.isValid(), true);
});

Deno.test("Token isExpired", () => {
  const pastDate = new Date(Date.now() - 1000);
  const token = new Token({ expiresAt: pastDate });
  assertEquals(token.isExpired(), true);
  assertEquals(token.isValid(), false);
});

Deno.test("Token isUsed and markUsed", () => {
  const token = Token.create({});
  assertEquals(token.isUsed(), false);
  token.markUsed();
  assertEquals(token.isUsed(), true);
  assertEquals(token.isValid(), false);
});

Deno.test("Token toJSON", () => {
  const expiresAt = new Date("2025-01-01");
  const token = new Token({ expiresAt });
  const json = token.tojSON;
  assertEquals(json.id, token.id);
  assertEquals(json.expiresAt, expiresAt);
  assertEquals(json.usedAt, undefined);
  assertEquals(json.createdAt, token.createdAt);
  assertEquals(json.updatedAt, token.updatedAt);
});

Deno.test("Token schema validation", () => {
  const schema = Token.schema;
  const valid = { expiresAt: new Date() };
  assertEquals(schema.safeParse(valid).success, true);
  const invalid = { expiresAt: "not-a-date" };
  assertEquals(schema.safeParse(invalid).success, false);
});

Deno.test("Token bodySchema validation", () => {
  const schema = Token.bodySchema;
  const valid = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    updatedAt: new Date(),
    expiresAt: new Date(),
  };
  assertEquals(schema.safeParse(valid).success, true);
  const invalid = {
    id: "not-a-uuid",
    createdAt: "not-a-date",
    updatedAt: new Date(),
    expiresAt: new Date(),
  };
  assertEquals(schema.safeParse(invalid).success, false);
});
