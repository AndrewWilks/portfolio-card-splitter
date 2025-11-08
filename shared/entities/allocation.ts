/**
 * Allocation Entity
 *
 * Represents how a Transaction's cost is split among Members.
 * Each Allocation defines one Member's share using either percentage (basisPoints) or fixed amount (amountCents).
 *
 * @module entities/allocation
 */

import { object, uuid, enum as zEnum } from "zod";
import { Entity, EntityData } from "./base/entity.ts";
import { calculateAmountUsingBasisPoints } from "../utilities/calculateAmountUsingBasisPoints.ts";
import { Cents, basisPoints, zCents, zBasisPoints } from "@shared/types";
import { AllocationRule } from "./allocationRule.ts";

/**
 * Allocation Data Interface
 *
 * Defines how a single Member's share of a Transaction is calculated.
 * Uses XOR pattern: either `basisPoints` (percentage) OR `amountCents` (fixed), never both.
 *
 * @interface AllocationData
 * @extends EntityData
 *
 * @property {string} transactionId - UUID of the parent Transaction
 * @property {string} memberId - UUID of the Member who owes this portion
 * @property {AllocationRule} rule - How to calculate the amount (PERCENTAGE, FIXED_AMOUNT, CALCULATED, EVEN_SPLIT)
 * @property {basisPoints} [basisPoints] - Percentage in basis points (10000 = 100%). Used for PERCENTAGE and EVEN_SPLIT rules.
 * @property {Cents} [amountCents] - Fixed amount in cents. Used for FIXED_AMOUNT and CALCULATED rules.
 *
 * @example
 * ```typescript
 * // Percentage-based allocation (50% of transaction)
 * const percentageAlloc: AllocationData = {
 *   id: "alloc-uuid",
 *   transactionId: "tx-uuid",
 *   memberId: "alice-uuid",
 *   rule: AllocationRule.PERCENTAGE,
 *   basisPoints: 5000,  // 50%
 *   amountCents: undefined, // Must be undefined when using basisPoints
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 *
 * // Fixed amount allocation ($25.00 of transaction)
 * const fixedAlloc: AllocationData = {
 *   id: "alloc-uuid",
 *   transactionId: "tx-uuid",
 *   memberId: "bob-uuid",
 *   rule: AllocationRule.FIXED_AMOUNT,
 *   basisPoints: undefined, // Must be undefined when using amountCents
 *   amountCents: 2500, // $25.00
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 *
 * @remarks
 * Key relationships:
 * - One Allocation belongs to one Transaction (N:1)
 * - One Allocation belongs to one Member (N:1)
 * - One Allocation has many Reservations (1:N) - funds reserved from Pots for this allocation
 *
 * Business rules (enforced in entity and service):
 * - XOR constraint: EXACTLY ONE of `basisPoints` OR `amountCents` must be provided, never both
 * - PERCENTAGE and EVEN_SPLIT rules require `basisPoints`
 * - FIXED_AMOUNT and CALCULATED rules require `amountCents`
 * - All allocations for a Transaction must sum to exactly Transaction.amountCents
 * - Cannot mix allocation types within a Transaction (all percentage OR all fixed)
 * - Member must exist and be active
 *
 * @see {@link Transaction} - Parent entity
 * @see {@link Member} - Who owes this amount
 * @see {@link Reservation} - Funds reserved from Pots for this allocation
 * @see {@link AllocationRule} - Rule enum defining calculation method
 */
export interface AllocationData extends EntityData {
  transactionId: string;
  memberId: string;
  rule: AllocationRule;
  basisPoints?: basisPoints;
  amountCents?: Cents;
}

// Re-export for backwards compatibility
export { AllocationRule };

/**
 * Allocation Entity Class
 *
 * Immutable entity representing one Member's share of a Transaction.
 * Enforces XOR constraint between basisPoints and amountCents.
 *
 * @class Allocation
 * @extends Entity
 *
 * @remarks
 * The entity stores both `basisPoints` and `amountCents` internally with safe defaults (0),
 * but validation ensures only one is actually used based on the `rule`.
 *
 * For PERCENTAGE/EVEN_SPLIT rules:
 * - `basisPoints` contains the percentage (10000 = 100%)
 * - `amountCents` is calculated: (transaction.amountCents * basisPoints) / 10000
 *
 * For FIXED_AMOUNT/CALCULATED rules:
 * - `amountCents` contains the fixed amount
 * - `basisPoints` is calculated: (amountCents * 10000) / transaction.amountCents
 *
 * @example
 * ```typescript
 * // Create percentage-based allocation
 * const alloc = Allocation.create({
 *   transactionId: "tx-uuid",
 *   memberId: "alice-uuid",
 *   rule: AllocationRule.PERCENTAGE,
 *   basisPoints: 5000, // 50%
 *   // amountCents is calculated automatically
 * });
 *
 * console.log(alloc.basisPoints); // 5000
 * console.log(alloc.rule); // AllocationRule.PERCENTAGE
 * ```
 */
export class Allocation extends Entity {
  static Rules = AllocationRule;

  private _transactionId: string;
  private _memberId: string;
  private _rule: AllocationRule;
  /**
   * The basisPoints of the transaction allocated to the member, in basis points.
   * For example, 5000 basis points = 50%
   */
  private _basisPoints: basisPoints;
  private _amountCents: Cents;

  constructor({
    id,
    createdAt,
    updatedAt,
    transactionId,
    memberId,
    rule,
    basisPoints,
    amountCents,
  }: AllocationData) {
    super({ id, createdAt, updatedAt });
    this._transactionId = transactionId;
    this._memberId = memberId;
    this._rule = rule;
    // Store values with safe defaults for optional fields
    this._amountCents = (amountCents ?? 0) as Cents;
    this._basisPoints = (basisPoints ?? 0) as basisPoints;
  }

  static create(data: AllocationData): Allocation {
    // Enforce mutual exclusivity: cannot have both basisPoints and amountCents
    if (data.basisPoints !== undefined && data.amountCents !== undefined) {
      throw new Error(
        "Allocation must not include both basisPoints and amountCents"
      );
    }

    // Validate based on rule
    if (data.rule === this.Rules.FIXED_AMOUNT) {
      if (data.amountCents === undefined) {
        throw new Error("Fixed amount allocations require amountCents");
      }
    } else if (data.rule === this.Rules.basisPoints) {
      if (data.basisPoints === undefined) {
        throw new Error("Basis points allocations require basisPoints");
      }
    } else {
      throw new Error("Invalid allocation rule");
    }

    const validated = this.schema.parse(data);

    return new Allocation(validated);
  }

  /**
   * Calculate the allocated amount based on transaction total
   * For basisPoints allocations, this calculates the actual amount
   * For fixed amount allocations, this returns the fixed amount
   */
  public calculateAmount(transactionAmountCents: Cents): Cents {
    switch (this._rule) {
      case AllocationRule.FIXED_AMOUNT:
        return this._amountCents || (0 as Cents);

      case AllocationRule.basisPoints:
        return calculateAmountUsingBasisPoints(
          this._basisPoints,
          transactionAmountCents
        );

      default:
        throw new Error("Invalid allocation rule");
    }
  }

  get transactionId(): string {
    return this._transactionId;
  }

  get memberId(): string {
    return this._memberId;
  }

  get rule(): AllocationRule {
    return this._rule;
  }

  get basisPoints(): basisPoints {
    return this._basisPoints;
  }

  get amountCents(): Cents {
    return this._amountCents;
  }

  override get toJSON() {
    return {
      id: this.id,
      transactionId: this._transactionId,
      memberId: this._memberId,
      rule: this._rule,
      basisPoints: this._basisPoints,
      amountCents: this._amountCents,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }

  static parse(data: unknown): Allocation {
    const parsed = this.schema.parse(data);
    return new Allocation(parsed);
  }

  // Validation schema
  static get schema() {
    return object({
      transactionId: uuid(),
      memberId: uuid(),
      rule: zEnum(AllocationRule),
      basisPoints: zBasisPoints.optional(),
      amountCents: zCents.min(0).optional(),
    }).refine(
      (obj) => {
        // For fixed amount, amountCents must be provided and basisPoints must not be set
        if (obj.rule === AllocationRule.FIXED_AMOUNT) {
          return (
            obj.amountCents !== undefined &&
            (obj.basisPoints === undefined || obj.basisPoints === 0)
          );
        }

        // For basisPoints, basisPoints must be provided and amountCents must not be set
        if (obj.rule === AllocationRule.basisPoints) {
          return (
            obj.basisPoints !== undefined &&
            (obj.amountCents === undefined || obj.amountCents === 0)
          );
        }

        return false;
      },
      {
        message:
          "Invalid allocation: for fixed_amount amountCents required and basisPoints must not be set; for basisPoints basisPoints required and amountCents must not be set",
      }
    );
  }

  // Schema for creating allocations (used in service layer)
  // Accepts "percentage" and "fixed_amount" as user-friendly rule names
  static get createSchema() {
    return object({
      memberId: uuid(),
      rule: zEnum(["percentage", "fixed_amount"] as const),
      percentage: zBasisPoints.optional(), // basis points (0-10000)
      amountCents: zCents.min(0).optional(),
    }).refine(
      (data) => {
        if (data.rule === "percentage") {
          return (
            data.percentage !== undefined && data.amountCents === undefined
          );
        }
        if (data.rule === "fixed_amount") {
          return (
            data.amountCents !== undefined && data.percentage === undefined
          );
        }
        return false;
      },
      {
        message:
          "Invalid allocation: percentage rule requires percentage, fixed_amount rule requires amountCents",
      }
    );
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
