import { Session } from "@shared/entities";
import type { SessionRepository } from "@backend/repositories";

/**
 * SessionService - Manages user session lifecycle
 *
 * Provides methods for creating, validating, and managing user sessions.
 * Sessions have configurable expiration (default 24 hours) and can be validated
 * for authentication purposes.
 */
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  /**
   * Create a new session for a user
   * @param userId - The ID of the user to create a session for
   * @param expirationHours - Hours until session expires (default 24)
   * @returns Promise resolving to the created and saved session
   */
  async create(userId: string, expirationHours = 24): Promise<Session> {
    const session = Session.create({
      userId,
      expirationHours,
    });

    const saved = await this.sessionRepository.save(session);
    return saved[0]; // save returns array, take first element
  }

  /**
   * Check if a session is valid (not expired and not used)
   * @param session - The session to validate
   * @returns true if session is valid, false otherwise
   */
  isValid(session: Session): boolean {
    return session.isValid();
  }

  /**
   * Calculate time until session expires in milliseconds
   * @param session - The session to check
   * @returns Milliseconds until expiry, or 0 if already expired
   */
  timeUntilExpiry(session: Session): number {
    const timeRemaining = session.expiresAt.getTime() - Date.now();
    return Math.max(0, timeRemaining);
  }

  /**
   * Delete a session (for logout)
   * @param sessionId - The ID of the session to delete
   */
  async delete(sessionId: string): Promise<void> {
    await this.sessionRepository.delete(sessionId);
  }

  /**
   * Delete all sessions for a user (for password reset)
   * @param userId - The ID of the user whose sessions to delete
   */
  async deleteAllForUser(userId: string): Promise<void> {
    const sessions = await this.sessionRepository.findByUserId(userId);
    await Promise.all(
      sessions.map((session) => this.sessionRepository.delete(session.id))
    );
  }

  /**
   * Find and validate a session by ID
   * Returns the session if valid, null otherwise
   * @param sessionId - The ID of the session to find
   * @returns Promise resolving to session if valid, null otherwise
   */
  async findValidSession(sessionId: string): Promise<Session | null> {
    const session = await this.sessionRepository.findById(sessionId);

    if (!session) {
      return null;
    }

    if (!this.isValid(session)) {
      // Clean up expired session
      await this.delete(sessionId);
      return null;
    }

    return session;
  }
}
