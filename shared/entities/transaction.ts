// For transactions table. Core entity with allocations, tags, and amount validation.

import { date, iso, object, string, uuid, enum as zEnum } from "zod";
import { Entity, EntityData } from "@shared/entities";
import { Cents, zCents } from "@shared/types";

export enum TransactionType {
  EXPENSE = "expense",
  INCOME = "income",
}

export interface TransactionData extends EntityData {
  cardAccountId: string;
  cardId?: string;
  merchantId: string;
  description: string;
  amountCents: Cents;
  type: TransactionType;
  transactionDate: Date;
  createdById: string;
}

export class Transaction extends Entity {
  static TransactionType = TransactionType;

  private _cardAccountId: string;
  private _cardId?: string;
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
    cardAccountId,
    cardId,
    amountCents,
    createdById,
    description,
    merchantId,
    transactionDate,
    type,
  }: TransactionData) {
    super({ id, createdAt, updatedAt });
    const validated = Transaction.schema.parse({
      cardAccountId,
      cardId,
      merchantId,
      description,
      amountCents,
      type,
      transactionDate,
      createdById,
    });
    this._cardAccountId = validated.cardAccountId;
    this._cardId = validated.cardId;
    this._amountCents = validated.amountCents;
    this._createdById = validated.createdById;
    this._description = validated.description;
    this._merchantId = validated.merchantId;
    this._transactionDate = validated.transactionDate;
    this._type = validated.type;
  }

  get cardAccountId(): string {
    return this._cardAccountId;
  }

  get cardId(): string | undefined {
    return this._cardId;
  }

  get merchantId(): string {
    return this._merchantId;
  }

  get description(): string {
    return this._description;
  }

  get amountCents(): Cents {
    return this._amountCents;
  }

  get type(): TransactionType {
    return this._type;
  }

  get transactionDate(): Date {
    return this._transactionDate;
  }

  get createdById(): string {
    return this._createdById;
  }

  override get toJSON() {
    return {
      ...super.toJSON,
      cardAccountId: this._cardAccountId,
      cardId: this._cardId,
      merchantId: this._merchantId,
      description: this._description,
      amountCents: this._amountCents,
      type: this._type,
      transactionDate: this._transactionDate,
      createdById: this._createdById,
    };
  }

  static parse(data: unknown): Transaction {
    const parsed = this.schema.parse(data) as TransactionData;
    return new Transaction(parsed);
  }

  // Validation schema
  static get schema() {
    return object({
      cardAccountId: uuid(),
      cardId: uuid().optional(),
      merchantId: uuid(),
      description: string().min(1).max(255),
      amountCents: zCents.positive(),
      type: zEnum(TransactionType),
      transactionDate: date().min(new Date(0)),
      createdById: uuid(),
    });
  }

  // Schema for creating transactions (used in service layer)
  static get createSchema() {
    return object({
      cardAccountId: uuid(),
      cardId: uuid().optional(),
      merchantId: uuid(),
      description: string().min(1).max(500),
      amountCents: zCents.positive(),
      type: zEnum(TransactionType).default(TransactionType.EXPENSE),
      transactionDate: iso.datetime().optional(),
      tagIds: uuid().array().optional(),
      allocations: object({}).array().min(1), // Will be refined in service to use Allocation.createSchema
    });
  }

  // Schema for updating transactions
  static get updateSchema() {
    return object({
      cardAccountId: uuid().optional(),
      cardId: uuid().optional(),
      merchantId: uuid().optional(),
      description: string().min(1).max(500).optional(),
      amountCents: zCents.positive().optional(),
      type: zEnum(TransactionType).optional(),
      transactionDate: iso.datetime().optional(),
      tagIds: uuid().array().optional(),
      allocations: object({}).array().min(1).optional(),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
