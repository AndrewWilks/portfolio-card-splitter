import {
  boolean,
  email,
  object,
  string,
  enum as zEnum,
  infer as zInfer,
} from "zod";

import { PasswordService } from "@shared/services";
import { Entity } from "./base/entity.ts";

export interface UserData extends Entity {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
}

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export class User extends Entity {
  static UserRole = UserRole;

  public readonly email: string;
  public readonly passwordHash: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly role: UserRole;
  public readonly isActive: boolean;

  constructor({
    id,
    email,
    passwordHash,
    firstName,
    lastName,
    role,
    isActive,
    createdAt,
    updatedAt,
  }: UserData) {
    super({ id, createdAt, updatedAt });

    this.email = email.toLowerCase().trim();
    this.passwordHash = passwordHash;
    this.firstName = firstName.trim();
    this.lastName = lastName.trim();
    this.role = role || User.UserRole.USER;
    this.isActive = isActive;
  }

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  get toJSON() {
    return {
      id: this.id,
      email: this.email,
      fullName: this.fullName,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  static parse(data: unknown): User {
    const parsed = this.bodySchema.parse(data) as UserData;
    return new User(parsed);
  }

  isAdmin(): boolean {
    return this.role === User.UserRole.USER;
  }

  canBootstrap(): boolean {
    return this.role === User.UserRole.ADMIN;
  }

  // Validation schemas
  static readonly createSchema = object({
    email: email().max(255),
    passwordHash: PasswordService.schema,
    firstName: string().min(1).max(100),
    lastName: string().min(1).max(100),
    role: zEnum(User.UserRole).optional(),
  });

  static readonly updateSchema = object({
    email: email().max(255).optional(),
    firstName: string().min(1).max(100).optional(),
    lastName: string().min(1).max(100).optional(),
    role: zEnum(User.UserRole).optional(),
    isActive: boolean().optional(),
  });

  static readonly loginSchema = object({
    email: email(),
    password: PasswordService.schema,
  });

  static readonly inviteSchema = object({
    email: email(),
    role: zEnum(User.UserRole).optional(),
  });

  static readonly acceptInviteSchema = object({
    token: string().min(1),
    password: PasswordService.schema,
    firstName: string().min(1),
    lastName: string().min(1),
  });

  static readonly requestPasswordResetSchema = object({
    email: email(),
  });

  static readonly resetPasswordSchema = object({
    token: string().min(1),
    password: PasswordService.schema,
  });

  static passwordService = PasswordService;

  static get schema() {
    return object({
      email: email().max(255),
      passwordHash: string().min(60).max(255),
      firstName: string().min(1).max(100),
      lastName: string().min(1).max(100),
      role: zEnum(User.UserRole),
      isActive: boolean().default(true),
    });
  }

  static override get bodySchema() {
    return super.bodySchema.extend(this.schema.shape);
  }
}

export type UserCreateRequest = zInfer<typeof User.createSchema>;
export type UserUpdateRequest = zInfer<typeof User.updateSchema>;
export type UserLoginRequest = zInfer<typeof User.loginSchema>;
export type UserInviteRequest = zInfer<typeof User.inviteSchema>;
export type UserAcceptInviteRequest = zInfer<typeof User.acceptInviteSchema>;
export type UserRequestPasswordReset = zInfer<
  typeof User.requestPasswordResetSchema
>;
export type UserResetPasswordRequest = zInfer<typeof User.resetPasswordSchema>;
