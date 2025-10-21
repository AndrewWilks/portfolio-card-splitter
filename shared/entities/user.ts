import { z } from "zod";
import { PasswordService } from "@shared/services";
import { UserRole, UserRoleType } from "./userRole.ts";

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly role: UserRoleType,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(data: {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role?: UserRoleType;
    isActive?: boolean;
  }): User {
    const now = new Date();

    return new User(
      data.id,
      data.email.toLowerCase().trim(),
      data.passwordHash,
      data.firstName.trim(),
      data.lastName.trim(),
      data.role || UserRole.USER,
      data.isActive ?? true,
      now,
      now,
    );
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  canBootstrap(): boolean {
    return this.role === UserRole.ADMIN;
  }

  // Validation schemas
  static readonly createSchema = z.object({
    email: z.email().max(255),
    password: PasswordService.schema,
    firstName: z.string().min(1).max(100),
    lastName: z.string().min(1).max(100),
    role: z.enum([UserRole.ADMIN, UserRole.USER]).optional(),
  });

  static readonly loginSchema = z.object({
    email: z.email(),
    password: PasswordService.schema,
  });

  static readonly inviteSchema = z.object({
    email: z.email(),
    role: z.enum([UserRole.ADMIN, UserRole.USER]).optional(),
  });

  static readonly acceptInviteSchema = z.object({
    token: z.string().min(1),
    password: PasswordService.schema,
    firstName: z.string().min(1),
    lastName: z.string().min(1),
  });

  static readonly requestPasswordResetSchema = z.object({
    email: z.email(),
  });

  static readonly resetPasswordSchema = z.object({
    token: z.string().min(1),
    password: PasswordService.schema,
  });

  static passwordService = PasswordService;
}
