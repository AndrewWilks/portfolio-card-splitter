import { assert } from "@std/assert";
import { CardAccountSettingsService } from "../../services/index.ts";
import { CardAccountSettingsRepository } from "../../repositories/index.ts";

Deno.test("CardAccountSettingsService - can be instantiated", () => {
  const service = new CardAccountSettingsService(
    new CardAccountSettingsRepository()
  );
  assert(service instanceof CardAccountSettingsService);
});

Deno.test("CardAccountSettingsService - getSettings method exists", () => {
  const service = new CardAccountSettingsService(
    new CardAccountSettingsRepository()
  );
  assert(typeof service.getSettings === "function");
});

Deno.test("CardAccountSettingsService - updateSettings method exists", () => {
  const service = new CardAccountSettingsService(
    new CardAccountSettingsRepository()
  );
  assert(typeof service.updateSettings === "function");
});

Deno.test("CardAccountSettingsService - resetToDefaults method exists", () => {
  const service = new CardAccountSettingsService(
    new CardAccountSettingsRepository()
  );
  assert(typeof service.resetToDefaults === "function");
});
