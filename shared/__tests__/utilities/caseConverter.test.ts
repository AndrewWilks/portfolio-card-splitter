import { assertEquals } from "@std/assert";
import {
  camelToSnake,
  objectKeysToCamel,
  objectKeysToSnake,
  snakeToCamel,
} from "../../utilities/caseConverter.ts";

Deno.test("snakeToCamel - converts snake_case to camelCase", () => {
  assertEquals(snakeToCamel("created_at"), "createdAt");
  assertEquals(snakeToCamel("from_pot_id"), "fromPotId");
  assertEquals(snakeToCamel("amount_cents"), "amountCents");
  assertEquals(snakeToCamel("simple"), "simple");
});

Deno.test("camelToSnake - converts camelCase to snake_case", () => {
  assertEquals(camelToSnake("createdAt"), "created_at");
  assertEquals(camelToSnake("fromPotId"), "from_pot_id");
  assertEquals(camelToSnake("amountCents"), "amount_cents");
  assertEquals(camelToSnake("simple"), "simple");
});

Deno.test(
  "objectKeysToCamel - converts object keys from snake_case to camelCase",
  () => {
    const input = {
      created_at: new Date("2024-01-01"),
      from_pot_id: "123",
      amount_cents: 1000,
      note: "test",
    };

    const expected = {
      createdAt: new Date("2024-01-01"),
      fromPotId: "123",
      amountCents: 1000,
      note: "test",
    };

    const result = objectKeysToCamel(input);
    assertEquals(result, expected);
  }
);

Deno.test(
  "objectKeysToSnake - converts object keys from camelCase to snake_case",
  () => {
    const input = {
      createdAt: new Date("2024-01-01"),
      fromPotId: "123",
      amountCents: 1000,
      note: "test",
    };

    const expected = {
      created_at: new Date("2024-01-01"),
      from_pot_id: "123",
      amount_cents: 1000,
      note: "test",
    };

    const result = objectKeysToSnake(input);
    assertEquals(result, expected);
  }
);

Deno.test("objectKeysToCamel - handles nested objects", () => {
  const input = {
    user_id: "123",
    user_profile: {
      first_name: "John",
      last_name: "Doe",
    },
  };

  const expected = {
    userId: "123",
    userProfile: {
      firstName: "John",
      lastName: "Doe",
    },
  };

  const result = objectKeysToCamel(input);
  assertEquals(result, expected);
});

Deno.test("objectKeysToCamel - handles arrays", () => {
  const input = {
    user_list: [
      { user_id: "1", user_name: "Alice" },
      { user_id: "2", user_name: "Bob" },
    ],
  };

  const expected = {
    userList: [
      { userId: "1", userName: "Alice" },
      { userId: "2", userName: "Bob" },
    ],
  };

  const result = objectKeysToCamel(input);
  assertEquals(result, expected);
});

Deno.test("objectKeysToCamel - handles null and undefined", () => {
  const input = {
    user_id: "123",
    deleted_at: null,
    optional_field: undefined,
  };

  const expected = {
    userId: "123",
    deletedAt: null,
    optionalField: undefined,
  };

  const result = objectKeysToCamel(input);
  assertEquals(result, expected);
});
