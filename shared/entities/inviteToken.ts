import z from "zod";
import { UserRole, UserRoleType } from "./userRole.ts";

export class InviteToken {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly role: UserRoleType,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    public readonly usedAt?: Date
  ) {}

  static create(data: {
    id: string;
    email: string;
    role?: UserRoleType;
    expirationHours?: number;
  }): InviteToken {
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + (data.expirationHours || 24) * 60 * 60 * 1000
    );

    return new InviteToken(
      data.id,
      data.email.toLowerCase().trim(),
      data.role || UserRole.USER,
      expiresAt,
      now
    );
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isUsed(): boolean {
    return this.usedAt !== undefined;
  }

  isValid(): boolean {
    return !this.isExpired() && !this.isUsed();
  }

  markUsed(): InviteToken {
    return new InviteToken(
      this.id,
      this.email,
      this.role,
      this.expiresAt,
      this.createdAt,
      new Date()
    );
  }

  // Validation schema
  static readonly schema = z.object({
    email: z.email().max(255),
    role: z.enum([UserRole.ADMIN, UserRole.USER]).optional(),
  });
}
