import { Session } from "@shared/entities";
import { SessionRepository as _SessionRepository } from "@backend/repositories";

/**
 * SessionService - Manages user session lifecycle
 * 
 * TODO: Implement service following the new pattern:
 * - Change from static methods to instance methods
 * - Add constructor with SessionRepository injection
 * - Implement create() to generate new session with expiration
 * - Implement isValid() to check session expiration and status
 * - Implement timeUntilExpiry() for session timeout calculations
 * - Implement refresh() to extend session expiration
 * - Use Session.createSchema for validation
 */
export class SessionService {
  // TODO: Add constructor(private sessionRepo: SessionRepository) {}
  // TODO: Convert static methods to instance methods
  static create(_userId: string, _expirationHours = 24): Session {
    // TODO: Implement create method to create new session
    throw new Error("Not implemented");
  }

  static isValid(_session: Session): boolean {
    // TODO: Implement isValid method to check if session is valid
    throw new Error("Not implemented");
  }

  static timeUntilExpiry(_session: Session): number {
    // TODO: Implement timeUntilExpiry method to calculate time until expiry
    throw new Error("Not implemented");
  }
}
