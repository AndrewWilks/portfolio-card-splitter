import { pgEnum } from "drizzle-orm/pg-core";

/**
 * Postgres enum for `allocation_rule`.
 *
 * Values describe how allocations are calculated (percentage or fixed amount).
 */
export const allocationRule = pgEnum("allocation_rule", [
  "percentage",
  "fixed_amount",
]);
