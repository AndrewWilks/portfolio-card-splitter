import { PasswordResetTokenRepository as SharedPasswordResetTokenRepository } from "@shared/repositories";
import { PasswordResetToken } from "@shared/entities";

export class PasswordResetTokenRepository extends SharedPasswordResetTokenRepository {
  override save(_token: PasswordResetToken): Promise<void> {
    // TODO: Implement save method to insert password reset token into database
    return Promise.reject("Not implemented");
  }

  override findById(_id: string): Promise<PasswordResetToken | null> {
    // TODO: Implement findById method to query password reset token by ID from database
    return Promise.reject("Not implemented");
  }

  override findByUserId(_userId: string): Promise<PasswordResetToken[]> {
    // TODO: Implement findByUserId method to query password reset tokens by user ID from database
    return Promise.reject("Not implemented");
  }

  override delete(_id: string): Promise<void> {
    // TODO: Implement delete method to remove password reset token from database
    return Promise.reject("Not implemented");
  }

  override deleteExpired(): Promise<void> {
    // TODO: Implement deleteExpired method to remove expired password reset tokens from database
    return Promise.reject("Not implemented");
  }
}
