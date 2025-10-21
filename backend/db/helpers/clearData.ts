import { db } from "../db.client.ts";
import { Schemas } from "../index.ts";

export async function clearDatabaseData() {
  await db.delete(Schemas.Tables.users);
  await db.delete(Schemas.Tables.events);
  await db.delete(Schemas.Tables.inviteTokens);
  await db.delete(Schemas.Tables.members);
  await db.delete(Schemas.Tables.passwordResetTokens);
  await db.delete(Schemas.Tables.payments);
  await db.delete(Schemas.Tables.pots);
  await db.delete(Schemas.Tables.reservations);
  await db.delete(Schemas.Tables.sessions);
  await db.delete(Schemas.Tables.transactions);
  await db.delete(Schemas.Tables.transactionTags);
  await db.delete(Schemas.Tables.transfers);
  await db.delete(Schemas.Tables.allocations);
  await db.delete(Schemas.Tables.merchants);
  await db.delete(Schemas.Tables.tags);
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
