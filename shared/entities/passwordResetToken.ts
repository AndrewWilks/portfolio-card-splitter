import z from "zod";

export class PasswordResetToken {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
    public readonly usedAt?: Date,
  ) {}

  static create(data: {
    id: string;
    userId: string;
    expirationHours?: number;
  }): PasswordResetToken {
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + (data.expirationHours || 24) * 60 * 60 * 1000,
    );

    return new PasswordResetToken(data.id, data.userId, expiresAt, now);
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

  markUsed(): PasswordResetToken {
    return new PasswordResetToken(
      this.id,
      this.userId,
      this.expiresAt,
      this.createdAt,
      new Date(),
    );
  }

  // Validation schema
  static readonly schema = z.object({
    userId: z.uuid(),
  });
}
