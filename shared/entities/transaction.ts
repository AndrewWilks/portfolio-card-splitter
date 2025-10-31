// For transactions table. Core entity with allocations, tags, and amount validation.

import { date, object, string, uuid, enum as zEnum } from "zod";
import { Entity, EntityData } from "@shared/entities";
import { Cents, zCents } from "@shared/types";

enum TransactionType {
  EXPENSE = "expense",
  INCOME = "income",
}

export interface TransactionData extends EntityData {
  merchantId: string;
  description: string;
  amountCents: Cents;
  type: TransactionType;
  transactionDate: Date;
  createdById: string;
}

export class Transaction extends Entity {
  static TransactionType = TransactionType;

  private _merchantId: string;
  private _description: string;
  private _amountCents: Cents;
  private _type: TransactionType;
  private _transactionDate: Date;
  private _createdById: string;

  constructor({
    id,
    createdAt,
    updatedAt,
    amountCents,
    createdById,
    description,
    merchantId,
    transactionDate,
    type,
  }: TransactionData) {
    super({ id, createdAt, updatedAt });
    this._amountCents = amountCents;
    this._createdById = createdById;
    this._description = description;
    this._merchantId = merchantId;
    this._transactionDate = transactionDate;
    this._type = type;
  }

  get toJSON() {
    return {
      id: this.id,
      merchantId: this._merchantId,
      description: this._description,
      amountCents: this._amountCents,
      type: this._type,
      transactionDate: this._transactionDate,
      createdById: this._createdById,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static parse(data: unknown): Transaction {
    const parsed = this.schema.parse(data) as TransactionData;
    return new Transaction(parsed);
  }

  // Validation schema
  static get schema() {
    return object({
      merchantId: uuid(),
      description: string().min(1).max(255),
      amountCents: zCents,
      type: zEnum(TransactionType),
      transactionDate: date().min(new Date(0)),
      createdById: uuid(),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
