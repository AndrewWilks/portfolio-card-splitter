import { db, Schemas } from "../../db/index.ts";
import { setupTestDB, teardownTestDB } from "../testHelpers.ts";

/**
 * Creates a test user with unique email
 */
export async function createTestUser() {
  const [user] = await db
    .insert(Schemas.Tables.users)
    .values({
      email: `test-${Date.now()}-${Math.random()}@example.com`,
      passwordHash: "test-hash",
      firstName: "Test",
      lastName: "User",
      role: "user",
    })
    .returning();

  return user;
}

/**
 * Creates a test merchant
 */
export async function createTestMerchant() {
  const [merchant] = await db
    .insert(Schemas.Tables.merchants)
    .values({
      name: `Test Merchant ${Date.now()}-${Math.random()}`,
    })
    .returning();

  return merchant;
}

/**
 * Creates a test member
 */
export async function createTestMember(userId: string) {
  const [member] = await db
    .insert(Schemas.Tables.members)
    .values({
      userId,
      displayName: `Test Member ${Date.now()}-${Math.random()}`,
    })
    .returning();

  return member;
}

/**
 * Helper to run a test with database cleanup
 */
export async function withCleanDatabase<T>(
  testFn: () => Promise<T>
): Promise<T> {
  await setupTestDB();
  try {
    return await testFn();
  } finally {
    await teardownTestDB();
  }
}
