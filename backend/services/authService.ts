import { AuthService as SharedAuthService } from "@shared/services";
import {
  User,
  Session,
  InviteToken,
  PasswordResetToken,
} from "@shared/entities";

export class AuthService extends SharedAuthService {
  override bootstrap(_data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<{ user: User; session: Session }> {
    // TODO: Implement bootstrap method to create first admin user and session
    return Promise.reject(new Error("Not implemented"));
  }

  override login(
    _email: string,
    _password: string
  ): Promise<{ user: User; session: Session }> {
    // TODO: Implement login method to authenticate user and create session
    return Promise.reject(new Error("Not implemented"));
  }

  override logout(_sessionId: string): Promise<void> {
    // TODO: Implement logout method to delete session
    return Promise.reject(new Error("Not implemented"));
  }

  override validateSession(
    _sessionId: string
  ): Promise<{ user: User; session: Session } | null> {
    // TODO: Implement validateSession method to check session validity and return user/session
    return Promise.reject(new Error("Not implemented"));
  }

  override invite(
    _email: string,
    _name?: string
  ): Promise<{ invitation: InviteToken; message: string }> {
    // TODO: Implement invite method to create invite token and send email
    return Promise.reject(new Error("Not implemented"));
  }

  override acceptInvite(
    _tokenId: string,
    _data: { password: string; firstName: string; lastName: string }
  ): Promise<{ user: User; session: Session }> {
    // TODO: Implement acceptInvite method to create user from invite and session
    return Promise.reject(new Error("Not implemented"));
  }

  override requestPasswordReset(_email: string): Promise<PasswordResetToken> {
    // TODO: Implement requestPasswordReset method to create reset token and send email
    return Promise.reject(new Error("Not implemented"));
  }

  override resetPassword(
    _tokenId: string,
    _newPassword: string
  ): Promise<{ user: User; session: Session }> {
    // TODO: Implement resetPassword method to update password and create session
    return Promise.reject(new Error("Not implemented"));
  }
}
