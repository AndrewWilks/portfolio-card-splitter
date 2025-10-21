import { assert } from "@std/assert";
import { crypto } from "@std/crypto/crypto";
import { UserRepository as _UserRepository } from "@backend/repositories";
import { User } from "@shared/entities";
import { db } from "@db";

const userRepo = new _UserRepository();

const id = crypto.randomUUID();
const email = "test@example.com";
const passwordHash = await User.passwordService.hashPassword("password123");
const firstName = "test";
const lastName = "user";
const isActive = true;
const role = "user";

const dummyUser = User.create({
  id,
  email: email,
  passwordHash,
  firstName,
  lastName,
  role,
  isActive,
});

Deno.test.afterEach(async () => {
  // Clean up
  // Note: Implement delete method in UserRepository for proper cleanup
  await userRepo.delete(id);
  await db.$client.end();
});

Deno.test("UserRepository - create", () => {
  assert(userRepo instanceof _UserRepository);
});

Deno.test("UserRepository - find by ID with save", async () => {
  await userRepo.save(dummyUser);

  const fetchedUser = await userRepo.findById(id);

  assert(fetchedUser !== null);
  assert(fetchedUser?.email === email);
  assert(fetchedUser?.firstName === firstName);
  assert(fetchedUser?.lastName === lastName);
  assert(fetchedUser?.isActive === isActive);
  assert(fetchedUser?.role === role);
});

Deno.test("UserRepository - findByEmail", async () => {
  await userRepo.save(dummyUser);

  const fetchedUser = await userRepo.findByEmail(email);

  assert(fetchedUser !== null);
  assert(fetchedUser?.email === email);
  assert(fetchedUser?.firstName === firstName);
  assert(fetchedUser?.lastName === lastName);
  assert(fetchedUser?.isActive === isActive);
  assert(fetchedUser?.role === role);
});

Deno.test("UserRepository - findByRole", async () => {
  await userRepo.save(dummyUser);

  const usersByRole = await userRepo.findByRole(role);
  assert(usersByRole.length > 0);
  const fetchedUser = usersByRole.find((user) => user.id === id);

  assert(fetchedUser !== undefined);
  assert(fetchedUser?.email === email);
  assert(fetchedUser?.firstName === firstName);
  assert(fetchedUser?.lastName === lastName);
  assert(fetchedUser?.isActive === isActive);
  assert(fetchedUser?.role === role);
});

// TODO: Add more test cases for UserRepository methods
