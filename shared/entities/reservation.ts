// For reservations table. Links pots/transactions, enforces amount limits.
// Each member reserves against their own allocation separately.
import { object, uuid } from "zod";
import { Entity, EntityData } from "./base/entity.ts";
import { Cents, zCents } from "@shared/types";

interface ReservationData extends EntityData {
  potId: string; // linked pot ID
  transactionId: string; // linked transaction ID
  allocationId?: string; // linked allocation ID (nullable)
  memberId: string; // linked member ID (required)
  amountCents: Cents; // reserved amount
}

export class Reservation extends Entity {
  private _potId: string;
  private _transactionId: string;
  private _allocationId?: string;
  private _memberId: string;
  private _amountCents: Cents;

  constructor({
    id,
    createdAt,
    updatedAt,
    potId,
    transactionId,
    allocationId,
    memberId,
    amountCents,
  }: ReservationData) {
    super({ id, createdAt, updatedAt });
    this._potId = potId;
    this._transactionId = transactionId;
    this._allocationId = allocationId;
    this._memberId = memberId;
    this._amountCents = amountCents;
  }

  get potId(): string {
    return this._potId;
  }

  get transactionId(): string {
    return this._transactionId;
  }

  get allocationId(): string | undefined {
    return this._allocationId;
  }

  get memberId(): string {
    return this._memberId;
  }

  get amountCents(): Cents {
    return this._amountCents;
  }

  override get toJSON() {
    return {
      id: this.id,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      potId: this._potId,
      transactionId: this._transactionId,
      allocationId: this._allocationId,
      memberId: this._memberId,
      amountCents: this._amountCents,
      isActive: this.isActive,
    };
  }

  static create(data: ReservationData): Reservation {
    const validated = this.schema.parse(data);
    return new Reservation(validated);
  }

  static parse(data: unknown): Reservation {
    const parsed = this.schema.parse(data) as ReservationData;
    return new Reservation(parsed);
  }

  static get schema() {
    return object({
      potId: uuid(),
      transactionId: uuid(),
      allocationId: uuid().optional(),
      memberId: uuid(),
      amountCents: zCents.min(0),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
