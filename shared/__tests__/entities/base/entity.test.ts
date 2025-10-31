import { assertEquals } from "jsr:@std/assert";
import { Entity } from "@shared/entities";

Deno.test("Entity constructor with no arguments", () => {
  const entity = new Entity();
  assertEquals(typeof entity.id, "string");
  assertEquals(entity.id.length, 36); // UUID length
  assertEquals(entity.createdAt instanceof Date, true);
  assertEquals(entity.updatedAt instanceof Date, true);
  assertEquals(entity.createdAt.getTime(), entity.updatedAt.getTime());
});

Deno.test("Entity constructor with id", () => {
  const customId = "123e4567-e89b-12d3-a456-426614174000";
  const entity = new Entity({ id: customId });
  assertEquals(entity.id, customId);
  assertEquals(entity.createdAt instanceof Date, true);
  assertEquals(entity.updatedAt instanceof Date, true);
});

Deno.test("Entity constructor with dates", () => {
  const created = new Date("2025-01-01");
  const updated = new Date("2025-01-02");
  const entity = new Entity({ createdAt: created, updatedAt: updated });
  assertEquals(entity.createdAt, created);
  assertEquals(entity.updatedAt, updated);
});

Deno.test("Entity urlParamsSchema validation", () => {
  const schema = Entity.urlParamsSchema;
  const valid = { id: "123e4567-e89b-12d3-a456-426614174000" };
  assertEquals(schema.safeParse(valid).success, true);
  const invalid = { id: "not-a-uuid" };
  assertEquals(schema.safeParse(invalid).success, false);
});

Deno.test("Entity bodySchema validation", () => {
  const schema = Entity.bodySchema;
  const valid = {
    id: "123e4567-e89b-12d3-a456-426614174000",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  assertEquals(schema.safeParse(valid).success, true);
  const invalid = {
    id: "not-a-uuid",
    createdAt: "not-a-date",
    updatedAt: new Date(),
  };
  assertEquals(schema.safeParse(invalid).success, false);
});
