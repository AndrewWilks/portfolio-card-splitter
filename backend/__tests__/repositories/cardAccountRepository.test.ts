import { assert } from "@std/assert";
import { CardAccountRepository } from "../../repositories/index.ts";

Deno.test("CardAccountRepository - can be instantiated", () => {
  const repository = new CardAccountRepository();
  assert(repository instanceof CardAccountRepository);
});

Deno.test("CardAccountRepository - save method exists", () => {
  const repository = new CardAccountRepository();
  assert(typeof repository.save === "function");
});

Deno.test("CardAccountRepository - findById method exists", () => {
  const repository = new CardAccountRepository();
  assert(typeof repository.findById === "function");
});

Deno.test("CardAccountRepository - findAll method exists", () => {
  const repository = new CardAccountRepository();
  assert(typeof repository.findAll === "function");
});

Deno.test("CardAccountRepository - delete method exists", () => {
  const repository = new CardAccountRepository();
  assert(typeof repository.delete === "function");
});

Deno.test("CardAccountRepository - findByOwnerId method exists", () => {
  const repository = new CardAccountRepository();
  assert(typeof repository.findByOwnerId === "function");
});

Deno.test("CardAccountRepository - findActiveByOwnerId method exists", () => {
  const repository = new CardAccountRepository();
  assert(typeof repository.findActiveByOwnerId === "function");
});
