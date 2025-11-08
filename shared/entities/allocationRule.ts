/**
 * Allocation Rule enum - defines how allocations are calculated.
 *
 * This enum is kept in a separate file with no dependencies so it can be
 * imported by both the entity layer and the database schema layer without
 * causing import resolution issues with Drizzle Kit.
 */
export enum AllocationRule {
  basisPoints = "basisPoints",
  FIXED_AMOUNT = "fixed_amount",
}
