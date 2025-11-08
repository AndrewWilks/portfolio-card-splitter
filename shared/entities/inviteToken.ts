import { date, email, object, enum as zEnum } from "zod";
import { Token, TokenData } from "@shared/entities";
import { User, UserRole } from "./user.ts";
import { calculateExpirationDate } from "../utilities/calculateExpirationDate.ts";

interface InviteTokenData extends TokenData {
  email: string;
  role: UserRole;
}

export class InviteToken extends Token {
  private _email: string;
  private _role: UserRole;

  constructor({
    id,
    email,
    role,
    expiresAt,
    createdAt,
    updatedAt,
  }: InviteTokenData) {
    super({
      id,
      createdAt,
      updatedAt,
      expiresAt,
    });
    this._email = email;
    this._role = role;
  }

  get email(): string {
    return this._email;
  }

  get role(): UserRole {
    return this._role;
  }

  static override create(data: {
    email: string;
    role?: UserRole;
    /**
     * Number of hours until the invite token expires. Defaults to 24 hours.
     */
    expirationHours?: number;
  }): InviteToken {
    const expiresAt = calculateExpirationDate(data.expirationHours || 24);

    return new InviteToken({
      email: data.email,
      role: data.role || User.UserRole.USER,
      expiresAt: expiresAt,
    });
  }

  // Validation schema
  static override get schema() {
    return object({
      email: email(),
      role: zEnum([User.UserRole.ADMIN, User.UserRole.USER]),
      expiresAt: date().min(new Date()),
      usedAt: date().optional(),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}
