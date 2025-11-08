import {
  InviteToken,
  PasswordResetToken,
  Session,
  User,
  UserRole,
} from "@shared/entities";
import {
  UserRepository as _UserRepository,
  SessionRepository as _SessionRepository,
  InviteTokenRepository as _InviteTokenRepository,
  PasswordResetTokenRepository as _PasswordResetTokenRepository,
} from "@backend/repositories";

/**
 * AuthService - Handles user authentication, sessions, and invitations
 *
 * TODO: Implement service following the new pattern:
 * - Add constructor with repository injections:
 *   - UserRepository, SessionRepository, InviteTokenRepository, PasswordResetTokenRepository
 * - Use entity createSchema for validation (User.createSchema, etc.)
 * - Implement password hashing with PasswordService
 * - Implement session token generation
 */
export class AuthService {
  constructor(
    private userRepo: _UserRepository,
    private sessionRepo: _SessionRepository,
    private inviteTokenRepo: _InviteTokenRepository,
    private passwordResetTokenRepo: _PasswordResetTokenRepository
  ) {}

  bootstrap(_data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: User; session: Session }> {
    // TODO: Implement bootstrap method to create first admin user and session
    return Promise.reject(new Error("Not implemented"));
  }

  login(
    _email: string,
    _password: string
  ): Promise<{ user: User; session: Session }> {
    // TODO: Implement login method to authenticate user and create session
    return Promise.reject(new Error("Not implemented"));
  }

  logout(_sessionId: string): Promise<void> {
    // TODO: Implement logout method to delete session
    return Promise.reject(new Error("Not implemented"));
  }

  validateSession(
    _sessionId: string
  ): Promise<{ user: User; session: Session } | null> {
    // TODO: Implement validateSession method to check session validity and return user/session
    return Promise.reject(new Error("Not implemented"));
  }

  invite(
    _inviterUserId: string,
    _email: string,
    _role: UserRole = UserRole.USER
  ): Promise<InviteToken> {
    // TODO: Implement invite method to create invite token and send email
    return Promise.reject(new Error("Not implemented"));
  }

  acceptInvite(
    _tokenId: string,
    _data: { password: string; firstName: string; lastName: string }
  ): Promise<{ user: User; session: Session }> {
    // TODO: Implement acceptInvite method to create user from invite and session
    return Promise.reject(new Error("Not implemented"));
  }

  requestPasswordReset(_email: string): Promise<PasswordResetToken> {
    // TODO: Implement requestPasswordReset method to create reset token and send email
    return Promise.reject(new Error("Not implemented"));
  }

  resetPassword(
    _tokenId: string,
    _newPassword: string
  ): Promise<{ user: User; session: Session }> {
    // TODO: Implement resetPassword method to update password and create session
    return Promise.reject(new Error("Not implemented"));
  }
}
