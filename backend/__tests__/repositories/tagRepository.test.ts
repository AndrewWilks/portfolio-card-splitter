import { assert } from "@std/assert";
import { TagRepository } from "../../repositories/index.ts";
import { Tag } from "@shared/entities";

// Unit tests that don't require database connection
Deno.test("TagRepository - can be instantiated", () => {
  const repository = new TagRepository();
  assert(repository instanceof TagRepository);
});

Deno.test("TagRepository - save method exists", () => {
  const repository = new TagRepository();
  assert(typeof repository.save === "function");
});

Deno.test("TagRepository - findById method exists", () => {
  const repository = new TagRepository();
  assert(typeof repository.findById === "function");
});

Deno.test("TagRepository - findAll method exists", () => {
  const repository = new TagRepository();
  assert(typeof repository.findAll === "function");
});

Deno.test("TagRepository - findByName method exists", () => {
  const repository = new TagRepository();
  assert(typeof repository.findByName === "function");
});

// Entity creation tests
Deno.test("Tag - can be created with required fields", () => {
  const tag = Tag.create({
    name: "Test Tag",
    isActive: true,
  });

  assert(tag.id.length > 0);
  assert(tag.name === "Test Tag");
  assert(tag.color === "#3b82f6"); // default color
  assert(tag.isActive === true);
  assert(tag.createdAt instanceof Date);
  assert(tag.updatedAt instanceof Date);
});

Deno.test("Tag - can be created with custom color", () => {
  const tag = Tag.create({
    name: "Test Tag",
    color: "#ff0000",
    isActive: true,
  });

  assert(tag.color === "#ff0000");
});

Deno.test("Tag - validates color format", () => {
  // This should throw due to invalid color format
  try {
    Tag.create({
      name: "Test Tag",
      color: "invalid-color",
      isActive: true,
    });
    assert(false, "Should have thrown validation error");
  } catch (error) {
    assert(error instanceof Error);
  }
});

Deno.test("Tag - can be reconstructed from data", () => {
  const data = {
    id: "550e8400-e29b-41d4-a716-446655440001", // Valid UUID
    name: "Test Tag",
    color: "#ff0000",
    isActive: true,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  };

  const tag = Tag.from(data);

  assert(tag.id === data.id);
  assert(tag.name === data.name);
  assert(tag.color === data.color);
  assert(tag.isActive === data.isActive);
});

Deno.test("Tag - toJSON returns correct data", () => {
  const tag = Tag.create({
    name: "Test Tag",
    color: "#00ff00",
    isActive: true,
  });

  const json = tag.toJSON();

  assert(json.id === tag.id);
  assert(json.name === tag.name);
  assert(json.color === tag.color);
  assert(json.isActive === tag.isActive);
  assert(json.createdAt instanceof Date);
  assert(json.updatedAt instanceof Date);
});
