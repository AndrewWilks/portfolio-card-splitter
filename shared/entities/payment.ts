// For payments table. Records payments from pots to transactions.

import { Entity, EntityData } from "@shared/entities";
import { date, object, string, uuid } from "zod";
import { Cents, zCents } from "@shared/types";

export interface PaymentData extends EntityData {
  paidOn: Date;
  potId: string;
  transactionId: string;
  reservationId?: string;
  amountCents: Cents;
  note?: string;
}

export class Payment extends Entity {
  private _paidOn: Date;
  private _potId: string;
  private _transactionId: string;
  private _reservationId?: string;
  private _amountCents: Cents;
  private _note?: string;

  constructor({
    id,
    createdAt,
    updatedAt,
    paidOn,
    potId,
    transactionId,
    reservationId,
    amountCents,
    note,
  }: PaymentData) {
    super({ id, createdAt, updatedAt });
    this._paidOn = paidOn;
    this._potId = potId;
    this._transactionId = transactionId;
    this._reservationId = reservationId;
    this._amountCents = amountCents;
    this._note = note;
  }

  get paidOn(): Date {
    return this._paidOn;
  }

  get potId(): string {
    return this._potId;
  }

  get transactionId(): string {
    return this._transactionId;
  }

  get reservationId(): string | undefined {
    return this._reservationId;
  }

  get amountCents(): Cents {
    return this._amountCents;
  }

  get note(): string | undefined {
    return this._note;
  }

  get toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      paidOn: this._paidOn,
      potId: this._potId,
      transactionId: this._transactionId,
      reservationId: this._reservationId,
      amountCents: this._amountCents,
      note: this._note,
    };
  }

  static parse(data: unknown): Payment {
    const parsed = this.schema.parse(data) as PaymentData;
    return new Payment(parsed);
  }

  static get schema() {
    return object({
      paidOn: date(),
      potId: uuid(),
      transactionId: uuid(),
      reservationId: uuid().optional(),
      amountCents: zCents.min(0),
      note: string().optional(),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
