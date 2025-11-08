/**
 * Transaction Entity
 * 
 * Core entity representing expenses or income on a CardAccount.
 * Transactions are split via Allocations to Members, reserved via Reservations, and paid via Payments.
 * 
 * @module entities/transaction
 */

import { date, iso, object, string, uuid, enum as zEnum } from "zod";
import { Entity, EntityData } from "@shared/entities";
import { Cents, zCents } from "@shared/types";

/**
 * Transaction Type Enum
 * 
 * @enum {string}
 * @property {string} EXPENSE - Money spent (positive amount reduces available funds)
 * @property {string} INCOME - Money received (positive amount increases available funds)
 */
export enum TransactionType {
  EXPENSE = "expense",
  INCOME = "income",
}

/**
 * Transaction Data Interface
 * 
 * Represents a financial transaction on a credit card account.
 * Every transaction must belong to exactly one CardAccount and one Merchant.
 * 
 * @interface TransactionData
 * @extends EntityData
 * 
 * @property {string} cardAccountId - UUID of the CardAccount this transaction belongs to (REQUIRED)
 * @property {string} [cardId] - UUID of the specific Card used (OPTIONAL, for attribution)
 * @property {string} merchantId - UUID of the Merchant where transaction occurred
 * @property {string} description - Human-readable description of the transaction
 * @property {Cents} amountCents - Transaction amount in cents (always positive, type determines debit/credit)
 * @property {TransactionType} type - "expense" (spending) or "income" (refund/payment)
 * @property {Date} transactionDate - When the transaction occurred (NOT when it was entered)
 * @property {string} createdById - UUID of the User who created this transaction record
 * 
 * @example
 * ```typescript
 * const txData: TransactionData = {
 *   id: "tx-uuid",
 *   cardAccountId: "chase-sapphire-uuid",  // REQUIRED
 *   cardId: "alice-card-uuid",              // OPTIONAL
 *   merchantId: "whole-foods-uuid",
 *   description: "Weekly groceries",
 *   amountCents: 15000,                     // $150.00
 *   type: TransactionType.EXPENSE,
 *   transactionDate: new Date("2025-11-07"),
 *   createdById: "user-uuid",
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * };
 * ```
 * 
 * @remarks
 * Key relationships:
 * - One Transaction belongs to one CardAccount (N:1) - REQUIRED
 * - One Transaction optionally belongs to one Card (N:1) - for attribution
 * - One Transaction belongs to one Merchant (N:1)
 * - One Transaction has many Allocations (1:N) - how it's split among Members
 * - One Transaction has many Reservations (1:N) - funds reserved from Pots
 * - One Transaction has many Payments (1:N) - actual payments made
 * - One Transaction belongs to one User (creator) (N:1)
 * 
 * Business rules enforced in TransactionService:
 * - Allocations must sum to exactly `amountCents` (100% split)
 * - Cannot mix percentage and fixed-amount allocations in same transaction
 * - All Members in allocations must exist and be active
 * - If `cardId` provided, must belong to the same `cardAccountId`
 * - Outstanding balance = Sum(Transactions) - Sum(Payments) per CardAccount
 * 
 * @see {@link CardAccount} - Parent account (REQUIRED relationship)
 * @see {@link Card} - Optional card attribution
 * @see {@link Allocation} - How transaction is split among members
 * @see {@link Reservation} - Funds reserved from pots for this transaction
 * @see {@link Payment} - Actual payments made against this transaction
 * @see {@link Merchant} - Where transaction occurred
 */
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

/**
 * Transaction Entity Class
 * 
 * Immutable entity representing a financial transaction.
 * Central to the expense splitting system.
 * 
 * @class Transaction
 * @extends Entity
 * 
 * @example
 * ```typescript
 * const tx = new Transaction({
 *   id: "tx-uuid",
 *   cardAccountId: "account-uuid",
 *   cardId: "card-uuid",
 *   merchantId: "merchant-uuid",
 *   description: "Team lunch",
 *   amountCents: 5000, // $50.00
 *   type: TransactionType.EXPENSE,
 *   transactionDate: new Date(),
 *   createdById: "user-uuid",
 *   createdAt: new Date(),
 *   updatedAt: new Date()
 * });
 * 
 * console.log(tx.amountCents); // 5000
 * console.log(tx.cardAccountId); // "account-uuid"
 * ```
 */
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
