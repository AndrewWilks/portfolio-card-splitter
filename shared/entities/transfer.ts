// For transfers table. Handles pot-to-pot or cash movements.
import { date, object, string, uuid } from "zod";
import { Entity, EntityData } from "./base/entity.ts";
import { Cents, zCents } from "@shared/types";

interface TransferData extends EntityData {
  fromPotId: string | null;
  toPotId: string | null;
  amountCents: Cents;
  occurredOn: Date;
  note?: string;
}

export class Transfer extends Entity {
  private _fromPotId: string | null;
  private _toPotId: string | null;
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

    // Invariant: at least one of fromPotId or toPotId must be non-null
    if (fromPotId === null && toPotId === null) {
      throw new Error(
        "Transfer must have at least one non-null pot ID (fromPotId or toPotId)"
      );
    }

    this._fromPotId = fromPotId;
    this._toPotId = toPotId;
    this._amountCents = amountCents;
    this._occurredOn = occurredOn;
    this._note = note;
  }

  /**
   * Check if this transfer represents a cash withdrawal (fromPotId is set, toPotId is null)
   */
  isCashOut(): boolean {
    return this._fromPotId !== null && this._toPotId === null;
  }

  /**
   * Check if this transfer represents a cash deposit (fromPotId is null, toPotId is set)
   */
  isCashIn(): boolean {
    return this._fromPotId === null && this._toPotId !== null;
  }

  /**
   * Check if this transfer is between two pots (both IDs are set)
   */
  isPotTransfer(): boolean {
    return this._fromPotId !== null && this._toPotId !== null;
  }

  get fromPotId(): string | null {
    return this._fromPotId;
  }

  get toPotId(): string | null {
    return this._toPotId;
  }

  get amountCents(): Cents {
    return this._amountCents;
  }

  override get toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      fromPotId: this._fromPotId,
      toPotId: this._toPotId,
      amountCents: this._amountCents,
      occurredOn: this._occurredOn,
      note: this._note,
      isActive: this.isActive,
    };
  }

  static parse(data: unknown): Transfer {
    const parsed = this.schema.parse(data) as TransferData;
    return new Transfer(parsed);
  }

  static get schema() {
    return object({
      fromPotId: uuid().nullable(),
      toPotId: uuid().nullable(),
      amountCents: zCents,
      occurredOn: date(),
      note: string().optional(),
    }).refine((data) => data.fromPotId !== null || data.toPotId !== null, {
      message:
        "At least one of fromPotId or toPotId must be non-null (to model cash or pot-to-pot transfers)",
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
