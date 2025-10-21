import { clearDatabaseData } from "../db/helpers/clearData.ts";

export async function setupTestDB() {
  // Clear all data before each test
  await clearDatabaseData();
}

export async function teardownTestDB() {
  // Clear all data after each test
  await clearDatabaseData();
}

export async function withTestDB<T>(testFn: () => Promise<T>): Promise<T> {
  await setupTestDB();
  try {
    return await testFn();
  } finally {
    await teardownTestDB();
  }
}
