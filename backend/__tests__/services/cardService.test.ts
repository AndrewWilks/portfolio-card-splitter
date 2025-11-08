import { assert } from "@std/assert";
import { CardService } from "../../services/index.ts";
import {
  CardRepository,
  CardAccountRepository,
} from "../../repositories/index.ts";

Deno.test("CardService - can be instantiated", () => {
  const service = new CardService(
    new CardRepository(),
    new CardAccountRepository()
  );
  assert(service instanceof CardService);
});

Deno.test("CardService - createCard method exists", () => {
  const service = new CardService(
    new CardRepository(),
    new CardAccountRepository()
  );
  assert(typeof service.createCard === "function");
});

Deno.test("CardService - listCards method exists", () => {
  const service = new CardService(
    new CardRepository(),
    new CardAccountRepository()
  );
  assert(typeof service.listCards === "function");
});

Deno.test("CardService - listCardsByMember method exists", () => {
  const service = new CardService(
    new CardRepository(),
    new CardAccountRepository()
  );
  assert(typeof service.listCardsByMember === "function");
});

Deno.test("CardService - getCard method exists", () => {
  const service = new CardService(
    new CardRepository(),
    new CardAccountRepository()
  );
  assert(typeof service.getCard === "function");
});

Deno.test("CardService - updateCard method exists", () => {
  const service = new CardService(
    new CardRepository(),
    new CardAccountRepository()
  );
  assert(typeof service.updateCard === "function");
});

Deno.test("CardService - deleteCard method exists", () => {
  const service = new CardService(
    new CardRepository(),
    new CardAccountRepository()
  );
  assert(typeof service.deleteCard === "function");
});
