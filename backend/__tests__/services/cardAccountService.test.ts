import { assert } from "@std/assert";
import { CardAccountService } from "../../services/index.ts";
import {
  CardAccountRepository,
  CardAccountSettingsRepository,
  TransactionRepository,
} from "../../repositories/index.ts";

Deno.test("CardAccountService - can be instantiated", () => {
  const service = new CardAccountService(
    new CardAccountRepository(),
    new CardAccountSettingsRepository(),
    new TransactionRepository()
  );
  assert(service instanceof CardAccountService);
});

Deno.test("CardAccountService - createCardAccount method exists", () => {
  const service = new CardAccountService(
    new CardAccountRepository(),
    new CardAccountSettingsRepository(),
    new TransactionRepository()
  );
  assert(typeof service.createCardAccount === "function");
});

Deno.test("CardAccountService - listCardAccounts method exists", () => {
  const service = new CardAccountService(
    new CardAccountRepository(),
    new CardAccountSettingsRepository(),
    new TransactionRepository()
  );
  assert(typeof service.listCardAccounts === "function");
});

Deno.test("CardAccountService - getCardAccount method exists", () => {
  const service = new CardAccountService(
    new CardAccountRepository(),
    new CardAccountSettingsRepository(),
    new TransactionRepository()
  );
  assert(typeof service.getCardAccount === "function");
});

Deno.test("CardAccountService - updateCardAccount method exists", () => {
  const service = new CardAccountService(
    new CardAccountRepository(),
    new CardAccountSettingsRepository(),
    new TransactionRepository()
  );
  assert(typeof service.updateCardAccount === "function");
});

Deno.test("CardAccountService - deleteCardAccount method exists", () => {
  const service = new CardAccountService(
    new CardAccountRepository(),
    new CardAccountSettingsRepository(),
    new TransactionRepository()
  );
  assert(typeof service.deleteCardAccount === "function");
});
