import { assert } from "@std/assert";
import { MerchantRepository } from "../../repositories/index.ts";
import { Merchant } from "@shared/entities";

// Unit tests that don't require database connection
Deno.test("MerchantRepository - can be instantiated", () => {
  const repository = new MerchantRepository();
  assert(repository instanceof MerchantRepository);
});

Deno.test("MerchantRepository - save method exists", () => {
  const repository = new MerchantRepository();
  assert(typeof repository.save === "function");
});

Deno.test("MerchantRepository - findById method exists", () => {
  const repository = new MerchantRepository();
  assert(typeof repository.findById === "function");
});

Deno.test("MerchantRepository - findByName method exists", () => {
  const repository = new MerchantRepository();
  assert(typeof repository.findByName === "function");
});

// Entity creation tests
Deno.test("Merchant - can be created with required fields", () => {
  const merchant = Merchant.create({
    name: "Test Merchant",
    isActive: true,
  });

  assert(merchant.id.length > 0);
  assert(merchant.name === "Test Merchant");
  assert(merchant.isActive === true);
  assert(merchant.createdAt instanceof Date);
  assert(merchant.updatedAt instanceof Date);
});

Deno.test("Merchant - can be created with optional location", () => {
  const merchant = Merchant.create({
    name: "Test Merchant",
    location: "Test Location",
    isActive: true,
  });

  assert(merchant.location === "Test Location");
});

Deno.test("Merchant - can be reconstructed from data", () => {
  const data = {
    id: "550e8400-e29b-41d4-a716-446655440000", // Valid UUID
    name: "Test Merchant",
    location: "Test Location",
    mergedIntoId: undefined,
    isActive: true,
    createdAt: new Date("2023-01-01"),
    updatedAt: new Date("2023-01-01"),
  };

  const merchant = Merchant.from(data);

  assert(merchant.id === data.id);
  assert(merchant.name === data.name);
  assert(merchant.location === data.location);
  assert(merchant.isActive === data.isActive);
});

Deno.test("Merchant - toJSON returns correct data", () => {
  const merchant = Merchant.create({
    name: "Test Merchant",
    location: "Test Location",
    isActive: true,
  });

  const json = merchant.toJSON();

  assert(json.id === merchant.id);
  assert(json.name === merchant.name);
  assert(json.location === merchant.location);
  assert(json.isActive === merchant.isActive);
  assert(json.createdAt instanceof Date);
  assert(json.updatedAt instanceof Date);
});
