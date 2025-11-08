import { assert } from "@std/assert";
import { CardRepository } from "../../repositories/index.ts";

Deno.test("CardRepository - can be instantiated", () => {
  const repository = new CardRepository();
  assert(repository instanceof CardRepository);
});

Deno.test("CardRepository - save method exists", () => {
  const repository = new CardRepository();
  assert(typeof repository.save === "function");
});

Deno.test("CardRepository - findById method exists", () => {
  const repository = new CardRepository();
  assert(typeof repository.findById === "function");
});

Deno.test("CardRepository - findAll method exists", () => {
  const repository = new CardRepository();
  assert(typeof repository.findAll === "function");
});

Deno.test("CardRepository - delete method exists", () => {
  const repository = new CardRepository();
  assert(typeof repository.delete === "function");
});

Deno.test("CardRepository - findByCardAccountId method exists", () => {
  const repository = new CardRepository();
  assert(typeof repository.findByCardAccountId === "function");
});

Deno.test("CardRepository - findByMemberId method exists", () => {
  const repository = new CardRepository();
  assert(typeof repository.findByMemberId === "function");
});

Deno.test("CardRepository - findActiveByCardAccountId method exists", () => {
  const repository = new CardRepository();
  assert(typeof repository.findActiveByCardAccountId === "function");
});
