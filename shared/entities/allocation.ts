import { object, uuid, enum as zEnum } from "zod";
import { Entity, EntityData } from "./base/entity.ts";
import { calculateAmountUsingBasisPoints } from "../utilities/calculateAmountUsingBasisPoints.ts";
import { Cents, basisPoints, zCents, zBasisPoints } from "@shared/types";

export interface AllocationData extends EntityData {
  transactionId: string;
  memberId: string;
  rule: AllocationRule;
  calculatedAmountCents?: Cents;
  basisPoints?: basisPoints;
  amountCents?: Cents;
}

enum AllocationRule {
  basisPoints = "basisPoints",
  FIXED_AMOUNT = "fixed_amount",
}

export class Allocation extends Entity {
  static Rules = AllocationRule;

  private _transactionId: string;
  private _memberId: string;
  private _rule: AllocationRule;
  private _calculatedAmountCents: Cents;
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
    calculatedAmountCents,
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
    this._calculatedAmountCents = (calculatedAmountCents ?? 0) as Cents;
  }

  static create(data: AllocationData): Allocation {
    // Enforce mutual exclusivity: cannot have both basisPoints and amountCents
    if (data.basisPoints !== undefined && data.amountCents !== undefined) {
      throw new Error(
        "Allocation must not include both basisPoints and amountCents"
      );
    }

    // Calculate the initial calculatedAmountCents based on rule
    let calculatedAmountCents: Cents;

    if (data.rule === this.Rules.FIXED_AMOUNT) {
      if (data.amountCents === undefined) {
        throw new Error("Fixed amount allocations require amountCents");
      }
      calculatedAmountCents = data.amountCents;
    } else if (data.rule === this.Rules.basisPoints) {
      if (data.basisPoints === undefined) {
        throw new Error("Basis points allocations require basisPoints");
      }
      // For basisPoints allocations, we'll set calculatedAmountCents to 0 initially
      // It will be calculated later when the transaction amount is known
      calculatedAmountCents = 0 as Cents;
    } else {
      throw new Error("Invalid allocation rule");
    }

    const validated = this.schema.parse({ ...data, calculatedAmountCents });

    return new Allocation(validated);
  }

  /**
   * Calculate the allocated amount based on transaction total
   * For basisPoints allocations, this calculates the actual amount
   * For fixed amount allocations, this returns the fixed amount
   */
  private calculateAmount(transactionAmountCents: Cents): Cents {
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

  get toJSON() {
    return {
      id: this.id,
      transactionId: this._transactionId,
      memberId: this._memberId,
      rule: this._rule,
      basisPoints: this._basisPoints,
      amountCents: this._amountCents,
      calculatedAmountCents: this._calculatedAmountCents,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
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
      calculatedAmountCents: zCents.min(0).optional(),
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

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
