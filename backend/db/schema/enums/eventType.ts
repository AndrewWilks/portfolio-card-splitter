import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Postgres enum for `event_type` used in audit logs.
 */
export const eventType = pgEnum("event_type", [
  "user_created",
  "user_updated",
  "user_deleted",
  "member_created",
  "member_updated",
  "member_deleted",
  "merchant_created",
  "merchant_updated",
  "merchant_merged",
  "tag_created",
  "tag_updated",
  "tag_deleted",
  "transaction_created",
  "transaction_updated",
  "transaction_deleted",
  "allocation_created",
  "allocation_updated",
  "allocation_deleted",
  "pot_created",
  "pot_updated",
  "pot_deleted",
  "reservation_created",
  "reservation_deleted",
  "transfer_created",
  "payment_created",
]);
