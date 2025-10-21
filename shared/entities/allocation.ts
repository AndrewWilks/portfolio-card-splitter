// For allocations table. Handles share types (percent/amount) and sum validation.

import { z } from "zod";

export const AllocationSchema = z
  .object({
    id: z.string().uuid(),
    transactionId: z.string().uuid(),
    memberId: z.string().uuid(),
    rule: z.enum(["percentage", "fixed_amount"]),
    percentage: z.number().int().min(0).max(10000).optional(), // 0-100% in basis points
    amountCents: z.number().int().min(0).optional(),
    calculatedAmountCents: z.number().int().min(0),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .refine(
    (data) => {
      // For percentage rule, percentage must be provided and amountCents must be undefined
      if (data.rule === "percentage") {
        return data.percentage !== undefined && data.amountCents === undefined;
      }
      // For fixed_amount rule, amountCents must be provided and percentage must be undefined
      if (data.rule === "fixed_amount") {
        return data.amountCents !== undefined && data.percentage === undefined;
      }
      return false;
    },
    {
      message:
        "Invalid allocation: percentage rule requires percentage, fixed_amount rule requires amountCents",
    }
  );

export type AllocationData = z.infer<typeof AllocationSchema>;

export class Allocation {
  constructor(
    public readonly id: string,
    public readonly transactionId: string,
    public readonly memberId: string,
    public readonly rule: "percentage" | "fixed_amount",
    public readonly calculatedAmountCents: number,
    public readonly percentage?: number, // basis points (e.g., 5000 = 50%)
    public readonly amountCents?: number,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(
    data: Omit<
      AllocationData,
      "id" | "createdAt" | "updatedAt" | "calculatedAmountCents"
    >
  ): Allocation {
    // Calculate the initial calculatedAmountCents
    let calculatedAmountCents: number;

    if (data.rule === "fixed_amount" && data.amountCents !== undefined) {
      calculatedAmountCents = data.amountCents;
    } else if (data.rule === "percentage") {
      // For percentage allocations, we'll set calculatedAmountCents to 0 initially
      // It will be calculated later when the transaction amount is known
      calculatedAmountCents = 0;
    } else {
      throw new Error("Invalid allocation data");
    }

    const validated = AllocationSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
      calculatedAmountCents: true,
    }).parse({ ...data, calculatedAmountCents });

    return new Allocation(
      crypto.randomUUID(),
      validated.transactionId,
      validated.memberId,
      validated.rule,
      calculatedAmountCents,
      validated.percentage,
      validated.amountCents,
      new Date(),
      new Date()
    );
  }

  static from(data: AllocationData): Allocation {
    const validated = AllocationSchema.parse(data);
    return new Allocation(
      validated.id,
      validated.transactionId,
      validated.memberId,
      validated.rule,
      validated.calculatedAmountCents,
      validated.percentage,
      validated.amountCents,
      validated.createdAt,
      validated.updatedAt
    );
  }

  /**
   * Calculate the allocated amount based on transaction total
   * For percentage allocations, this calculates the actual amount
   * For fixed amount allocations, this returns the fixed amount
   */
  calculateAmount(transactionAmountCents: number): number {
    if (this.rule === "fixed_amount") {
      return this.amountCents || 0;
    } else if (this.rule === "percentage" && this.percentage !== undefined) {
      // Convert basis points to decimal (5000 basis points = 50%)
      const percentageDecimal = this.percentage / 10000;
      return Math.round(transactionAmountCents * percentageDecimal);
    }
    return 0;
  }

  toJSON(): AllocationData {
    return {
      id: this.id,
      transactionId: this.transactionId,
      memberId: this.memberId,
      rule: this.rule,
      percentage: this.percentage,
      amountCents: this.amountCents,
      calculatedAmountCents: this.calculatedAmountCents,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
