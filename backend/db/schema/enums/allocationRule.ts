import { pgEnum } from "drizzle-orm/pg-core";
import { AllocationRule } from "../../../../shared/entities/allocationRule.ts";

/**
 * Postgres enum for `allocation_rule`.
 *
 * Values describe how allocations are calculated (percentage or fixed amount).
 *
 * Single source of truth: shared/entities/allocationRule.ts
 * Note: Uses relative import instead of @shared/entities alias because
 * Drizzle Kit doesn't understand Deno import maps.
 */
export const allocationRule = pgEnum("allocation_rule", AllocationRule);
