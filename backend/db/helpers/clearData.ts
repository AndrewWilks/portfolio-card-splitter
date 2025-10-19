import { db } from "../db.client.ts";
import * as schema from "../db.schema.ts";

export async function clearDatabaseData() {
  await db.delete(schema.Tables.users);
  await db.delete(schema.Tables.events);
  await db.delete(schema.Tables.inviteTokens);
  await db.delete(schema.Tables.members);
  await db.delete(schema.Tables.passwordResetTokens);
  await db.delete(schema.Tables.payments);
  await db.delete(schema.Tables.pots);
  await db.delete(schema.Tables.reservations);
  await db.delete(schema.Tables.sessions);
  await db.delete(schema.Tables.transactions);
  await db.delete(schema.Tables.transactionTags);
  await db.delete(schema.Tables.transfers);
  await db.delete(schema.Tables.allocations);
  await db.delete(schema.Tables.merchants);
  await db.delete(schema.Tables.tags);
}

if (import.meta.main) {
  console.log("Clearing database data...");
  clearDatabaseData()
    .then(() => {
      console.log("Database data cleared.");
    })
    .catch((error) => {
      console.error("Error clearing database data:", error);
    });
}
