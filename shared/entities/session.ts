import { Entity, EntityData } from "@shared/entities";
import { calculateExpirationDate } from "../utilities/calculateExpirationDate.ts";
import { date, object, uuid } from "zod";

export interface SessionData extends EntityData {
  userId: string;
  expiresAt: Date;
}
// TODO: Session ergonomics, your create({ expirationHours }) factory is right, add isExpired(), markUsed() that is idempotent, and a guard that prevents reuse.

export class Session extends Entity {
  private _userId: string;
  private _expiresAt: Date;

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

  isValid(): boolean {
    return !this.isExpired();
  }

  refresh(expirationHours?: number): this {
    this._expiresAt = calculateExpirationDate(expirationHours ?? 1);
    return this;
  }

  get toJSON() {
    return {
      id: this.id,
      userId: this._userId,
      expiresAt: this._expiresAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
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
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
