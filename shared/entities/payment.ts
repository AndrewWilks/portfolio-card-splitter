// For payments table. Links pots/transactions, with reservation support.

import { Entity, EntityData } from "@shared/entities";
import { date, number, object, string, uuid } from "zod";
import { Cents, zCents } from "@shared/types";

export interface PaymentData extends EntityData {
  paidOn?: Date;
  potId?: string;
  transactionId?: string;
  reservationId?: string;
  amountCents?: Cents;
  note?: string;
}

export class Payment extends Entity {
  private _paidOn?: Date;
  private _potId?: string;
  private _transactionId?: string;
  private _reservationId?: string;
  private _amountCents?: Cents;
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
      paidOn: date().optional(),
      potId: uuid().optional(),
      transactionId: uuid().optional(),
      reservationId: uuid().optional(),
      amountCents: zCents.min(0).optional(),
      note: string().optional(),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
