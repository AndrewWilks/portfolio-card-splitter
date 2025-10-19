import { crypto } from "@std/crypto";
import { Session } from "@shared/entities";

export class SessionService {
  static create(userId: string, expirationHours = 24): Session {
    return Session.create({
      id: crypto.randomUUID(),
      userId,
      expirationHours,
    });
  }

  static isValid(session: Session): boolean {
    return session.isValid();
  }

  static timeUntilExpiry(session: Session): number {
    return Math.max(0, session.expiresAt.getTime() - Date.now());
  }
}
