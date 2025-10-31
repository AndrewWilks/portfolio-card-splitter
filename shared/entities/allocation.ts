import { object, uuid, enum as zEnum } from "zod";
import { Entity, EntityData } from "./base/entity.ts";
import { calculateAmountUsingBasisPoints } from "../utilities/calculateAmountUsingBasisPoints.ts";
import { Cents, basisPoints, zCents, zBasisPoints } from "@shared/types";

export interface AllocationData extends EntityData {
  transactionId: string;
  memberId: string;
  rule: AllocationRule;
  calculatedAmountCents?: Cents;
  basisPoints: basisPoints;
  amountCents: Cents;
}

enum AllocationRule {
  basisPoints = "basisPoints",
  FIXED_AMOUNT = "fixed_amount",
}

// TODO: enforce one of, if rule is percentage then compute calculatedAmountCents from basisPoints, if rule is fixed amount then require amountCents, do not allow both to be set.
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
    this._amountCents = amountCents;
    this._calculatedAmountCents =
      calculatedAmountCents || this.calculateAmount(amountCents);
    this._basisPoints = basisPoints;
  }

  static create(data: AllocationData): Allocation {
    // Calculate the initial calculatedAmountCents
    let calculatedAmountCents: Cents;

    if (
      data.rule === this.Rules.FIXED_AMOUNT &&
      data.amountCents !== undefined
    ) {
      calculatedAmountCents = data.amountCents;
    } else if (data.rule === this.Rules.basisPoints) {
      // For basisPoints allocations, we'll set calculatedAmountCents to 0 initially
      // It will be calculated later when the transaction amount is known
      calculatedAmountCents = 0 as Cents;
    } else {
      throw new Error("Invalid allocation data");
    }

    const validated = this.schema.parse({ ...data, calculatedAmountCents });

    return new Allocation(validated);
  }

  /**
   * Calculate the allocated amount based on transaction total
   * For basisPoints allocations, this calculates the actual amount
   * For fixed amount allocations, this returns the fixed amount
   */
  calculateAmount(transactionAmountCents: Cents): Cents {
    switch (this._rule) {
      case "fixed_amount":
        return this._amountCents || (0 as Cents);

      case "basisPoints":
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
      calculatedAmountCents: zCents.min(0),
      basisPoints: zBasisPoints,
      amountCents: zCents.min(0),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
