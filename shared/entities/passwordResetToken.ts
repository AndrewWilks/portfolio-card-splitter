import { date, object, uuid } from "zod";
import { Token, TokenData } from "@shared/entities";
import { calculateExpirationDate } from "../utilities/calculateExpirationDate.ts";

interface PasswordResetTokenData extends TokenData {
  userId: string;
}

export class PasswordResetToken extends Token {
  private _userId: string;

  constructor({
    id,
    createdAt,
    updatedAt,
    userId,
    expiresAt,
    usedAt,
  }: PasswordResetTokenData) {
    super({ id, createdAt, updatedAt, expiresAt, usedAt });
    this._userId = userId;
  }

  get userId(): string {
    return this._userId;
  }

  get token(): string {
    return this.id; // Token string is the entity ID
  }

  static override create(data: {
    id: string;
    userId: string;
    expirationHours?: number;
  }): PasswordResetToken {
    const expiresAt = calculateExpirationDate(data.expirationHours ?? 1);

    return new PasswordResetToken({
      userId: data.userId,
      expiresAt,
    });
  }

  override get toJSON() {
    return {
      id: this.id,
      userId: this._userId,
      expiresAt: this._expiresAt,
      usedAt: this._usedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      isActive: this.isActive,
    };
  }

  // Validation schema
  static override get schema() {
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
