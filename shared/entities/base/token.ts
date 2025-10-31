import { date, object } from "zod";
import { Entity, EntityData } from "@shared/entities";
import { calculateExpirationDate } from "../../utilities/calculateExpirationDate.ts";

export interface TokenData extends EntityData {
  expiresAt: Date;
  usedAt?: Date;
}

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

  /**
   * Mark the token as used. This method is idempotent: calling it multiple
   * times will not change the originally recorded usedAt timestamp.
   */
  private markUsed(): this {
    if (this._usedAt) return this; // idempotent
    this._usedAt = new Date();
    return this;
  }

  /**
   * Assert that the token can be used — not expired and not already used.
   * Throws an Error if the token is not usable.
   */
  private assertCanUse(): void {
    if (this.isExpired()) throw new Error("Token is expired");
    if (this.isUsed()) throw new Error("Token has already been used");
  }

  /**
   * High-level helper that enforces the guard and marks the token used.
   * Throws if the token is expired or already used. Returns `this`.
   */
  use(): this {
    this.assertCanUse();
    return this.markUsed();
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
