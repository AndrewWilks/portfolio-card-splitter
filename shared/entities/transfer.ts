// For transfers table. Handles pot-to-pot or cash movements.
import { date, object, string, uuid } from "zod";
import { Entity, EntityData } from "./base/entity.ts";
import { Cents, zCents } from "@shared/types";

interface TransferData extends EntityData {
  fromPotId: string;
  toPotId: string;
  amountCents: Cents;
  occurredOn: Date;
  note?: string;
}

// TODO: Transfers and cash, allow fromPotId or toPotId to be null to model cash, never both null, add an invariant in constructor, and a Zod refinement to enforce it.

export class Transfer extends Entity {
  private _fromPotId: string;
  private _toPotId: string;
  private _amountCents: Cents;
  private _occurredOn: Date;
  private _note?: string;

  constructor({
    id,
    createdAt,
    updatedAt,
    fromPotId,
    toPotId,
    amountCents,
    occurredOn,
    note,
  }: TransferData) {
    super({ id, createdAt, updatedAt });
    this._fromPotId = fromPotId;
    this._toPotId = toPotId;
    this._amountCents = amountCents;
    this._occurredOn = occurredOn;
    this._note = note;
  }

  get toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      fromPotId: this._fromPotId,
      toPotId: this._toPotId,
      amountCents: this._amountCents,
      occurredOn: this._occurredOn,
      note: this._note,
    };
  }

  static parse(data: unknown): Transfer {
    const parsed = this.schema.parse(data) as TransferData;
    return new Transfer(parsed);
  }

  static get schema() {
    return object({
      fromPotId: uuid(),
      toPotId: uuid(),
      amountCents: zCents,
      occurredOn: date(),
      note: string().optional(),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
