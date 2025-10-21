// For transactions table. Core entity with allocations, tags, and amount validation.

import { z } from "zod";

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  merchantId: z.string().uuid(),
  description: z.string().min(1).max(500),
  amountCents: z.number().int().positive(),
  type: z.enum(["expense", "income"]),
  transactionDate: z.date(),
  createdById: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TransactionData = z.infer<typeof TransactionSchema>;

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly merchantId: string,
    public readonly description: string,
    public readonly amountCents: number,
    public readonly type: "expense" | "income",
    public readonly transactionDate: Date,
    public readonly createdById: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date()
  ) {}

  static create(
    data: Omit<TransactionData, "id" | "createdAt" | "updatedAt">
  ): Transaction {
    const validated = TransactionSchema.omit({
      id: true,
      createdAt: true,
      updatedAt: true,
    }).parse(data);

    return new Transaction(
      crypto.randomUUID(),
      validated.merchantId,
      validated.description,
      validated.amountCents,
      validated.type,
      validated.transactionDate,
      validated.createdById,
      new Date(),
      new Date()
    );
  }

  static from(data: TransactionData): Transaction {
    const validated = TransactionSchema.parse(data);
    return new Transaction(
      validated.id,
      validated.merchantId,
      validated.description,
      validated.amountCents,
      validated.type,
      validated.transactionDate,
      validated.createdById,
      validated.createdAt,
      validated.updatedAt
    );
  }

  toJSON(): TransactionData {
    return {
      id: this.id,
      merchantId: this.merchantId,
      description: this.description,
      amountCents: this.amountCents,
      type: this.type,
      transactionDate: this.transactionDate,
      createdById: this.createdById,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
