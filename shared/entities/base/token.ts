import { date, object } from "zod";
import { Entity, EntityData } from "@shared/entities";
import { calculateExpirationDate } from "../../utilities/calculateExpirationDate.ts";

export interface TokenData extends EntityData {
  expiresAt: Date;
  usedAt?: Date;
}
// TODO: Token ergonomics, your create({ expirationHours }) factory is right, add isExpired(), markUsed() that is idempotent, and a guard that prevents reuse.

export class Token extends Entity {
  protected _expiresAt: Date;
  protected _usedAt?: Date;
  constructor({ id, createdAt, updatedAt, expiresAt, usedAt }: TokenData) {
    super({ id, createdAt, updatedAt });
    this._expiresAt = expiresAt;
    this._usedAt = usedAt;
  }

  static create(data: { expirationHours?: number }): Token {
    const expiresAt = calculateExpirationDate(data.expirationHours ?? 1);

    return new Token({
      expiresAt,
    });
  }

  isExpired(): boolean {
    return new Date() > this._expiresAt;
  }

  isUsed(): boolean {
    return this._usedAt !== undefined;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isUsed();
  }

  markUsed(): this {
    this._usedAt = new Date();
    return this;
  }

  get tojSON() {
    return {
      id: this.id,
      expiresAt: this._expiresAt,
      usedAt: this._usedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static get schema() {
    return object({
      expiresAt: date(),
      usedAt: date().optional(),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
