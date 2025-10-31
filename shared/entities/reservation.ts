// For reservations table. Links pots/transactions, enforces amount limits.
import { object, uuid } from "zod";
import { Entity, EntityData } from "./base/entity.ts";
import { Cents, zCents } from "@shared/types";

interface ReservationData extends EntityData {
  potId: string; // linked pot ID
  transactionId: string; // linked transaction ID
  amountCents: Cents; // reserved amount
}

export class Reservation extends Entity {
  private _potId: string;
  private _transactionId: string;
  private _amountCents: Cents;

  constructor({
    id,
    createdAt,
    updatedAt,
    potId,
    transactionId,
    amountCents,
  }: ReservationData) {
    super({ id, createdAt, updatedAt });
    this._potId = potId;
    this._transactionId = transactionId;
    this._amountCents = amountCents;
  }

  get toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      potId: this._potId,
      transactionId: this._transactionId,
      amountCents: this._amountCents,
    };
  }

  static parse(data: unknown): Reservation {
    const parsed = this.schema.parse(data) as ReservationData;
    return new Reservation(parsed);
  }

  static get schema() {
    return object({
      potId: uuid(),
      transactionId: uuid(),
      amountCents: zCents.min(0),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
