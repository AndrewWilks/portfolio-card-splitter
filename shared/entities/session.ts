export class Session {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date,
  ) {}

  static create(data: {
    id: string;
    userId: string;
    expirationHours?: number;
  }): Session {
    const now = new Date();
    const expiresAt = new Date(
      now.getTime() + (data.expirationHours || 24) * 60 * 60 * 1000,
    );

    return new Session(data.id, data.userId, expiresAt, now);
  }

  isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  isValid(): boolean {
    return !this.isExpired();
  }
}
