import { Tables } from "@db/tables";
import { entities } from "@shared/entities-map";

/**
 * Explicit mapping between entity names and database table references.
 * This avoids fragile pluralization logic.
 */
export const entityTableMap: Record<
  keyof typeof entities,
  keyof typeof Tables
> = {
  User: "users",
  Session: "sessions",
  InviteToken: "inviteTokens",
  PasswordResetToken: "passwordResetTokens",
  Member: "members",
  Merchant: "merchants",
  Transaction: "transactions",
  Payment: "payments",
  Pot: "pots",
  Reservation: "reservations",
  Tag: "tags",
  Transfer: "transfers",
  Event: "events",
  Allocation: "allocations",
};

/**
 * Entities that support soft delete (have isActive field)
 */
export const softDeleteEntities = new Set<keyof typeof entities>([
  "User",
  "Session",
  "Member",
  "Merchant",
  "Transaction",
  "Pot",
  "Tag",
  "Event",
  "Payment",
  "Reservation",
  "Transfer",
  "Allocation",
]);

/**
 * Entities that do NOT support soft delete (no isActive field)
 * These must use hard delete
 */
export const hardDeleteEntities = new Set<keyof typeof entities>([
  "InviteToken",
  "PasswordResetToken",
]);
