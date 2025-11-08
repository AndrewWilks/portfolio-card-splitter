import { db } from "../db.client.ts";
import { Schemas } from "../index.ts";

export async function clearDatabaseData() {
  // Delete in order that respects foreign key constraints
  // Start with child tables that reference other tables
  await db.delete(Schemas.Tables.allocations);
  await db.delete(Schemas.Tables.transactionTags);
  await db.delete(Schemas.Tables.payments);
  await db.delete(Schemas.Tables.reservations);
  await db.delete(Schemas.Tables.transfers);
  await db.delete(Schemas.Tables.transactions);
  await db.delete(Schemas.Tables.cards);
  await db.delete(Schemas.Tables.cardAccountSettings);
  await db.delete(Schemas.Tables.cardAccounts);
  await db.delete(Schemas.Tables.pots);
  await db.delete(Schemas.Tables.members);
  await db.delete(Schemas.Tables.sessions);
  await db.delete(Schemas.Tables.passwordResetTokens);
  await db.delete(Schemas.Tables.inviteTokens);
  await db.delete(Schemas.Tables.events);
  await db.delete(Schemas.Tables.merchants);
  await db.delete(Schemas.Tables.tags);
  // Delete users last as many tables reference it
  await db.delete(Schemas.Tables.users);
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
