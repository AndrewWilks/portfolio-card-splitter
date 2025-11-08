import { assert } from "@std/assert";
import { CardAccountSettingsRepository } from "../../repositories/index.ts";

Deno.test("CardAccountSettingsRepository - can be instantiated", () => {
  const repository = new CardAccountSettingsRepository();
  assert(repository instanceof CardAccountSettingsRepository);
});

Deno.test("CardAccountSettingsRepository - save method exists", () => {
  const repository = new CardAccountSettingsRepository();
  assert(typeof repository.save === "function");
});

Deno.test("CardAccountSettingsRepository - findById method exists", () => {
  const repository = new CardAccountSettingsRepository();
  assert(typeof repository.findById === "function");
});

Deno.test("CardAccountSettingsRepository - findAll method exists", () => {
  const repository = new CardAccountSettingsRepository();
  assert(typeof repository.findAll === "function");
});

Deno.test("CardAccountSettingsRepository - delete method exists", () => {
  const repository = new CardAccountSettingsRepository();
  assert(typeof repository.delete === "function");
});

Deno.test(
  "CardAccountSettingsRepository - findByCardAccountId method exists",
  () => {
    const repository = new CardAccountSettingsRepository();
    assert(typeof repository.findByCardAccountId === "function");
  }
);
