import { Entity, EntityData } from "@shared/entities";
import { calculateExpirationDate } from "../utilities/calculateExpirationDate.ts";
import { date, object, uuid } from "zod";

export interface SessionData extends EntityData {
  userId: string;
  expiresAt: Date;
  usedAt?: Date;
}

export class Session extends Entity {
  private _userId: string;
  private _expiresAt: Date;
  private _usedAt?: Date;

  constructor({ id, userId, expiresAt, createdAt, updatedAt }: SessionData) {
    super({ id, createdAt, updatedAt });
    this._userId = userId;
    this._expiresAt = expiresAt;
  }

  static create(data: { userId: string; expirationHours?: number }): Session {
    const expiresAt = calculateExpirationDate(data.expirationHours ?? 1);

    return new Session({ userId: data.userId, expiresAt });
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

  refresh(expirationHours?: number): this {
    this._expiresAt = calculateExpirationDate(expirationHours ?? 1);
    return this;
  }

  /**
   * Mark the session as used. Idempotent — doesn't change usedAt after first call.
   */
  private markUsed(): this {
    if (this._usedAt) return this;
    this._usedAt = new Date();
    return this;
  }

  /**
   * Guard that throws if the session cannot be used.
   */
  private assertCanUse(): void {
    if (this.isExpired()) throw new Error("Session is expired");
    if (this.isUsed()) throw new Error("Session has already been used");
  }

  /**
   * High-level helper that enforces the guard and marks the session used.
   */
  use(): this {
    this.assertCanUse();
    return this.markUsed();
  }

  override get toJSON() {
    return {
      id: this.id,
      userId: this._userId,
      usedAt: this._usedAt,
      expiresAt: this._expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }

  static parse(data: unknown): Session {
    const parsed = this.schema.parse(data) as SessionData;
    return new Session(parsed);
  }

  static get schema() {
    return object({
      userId: uuid(),
      expiresAt: date(),
      usedAt: date().optional(),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
