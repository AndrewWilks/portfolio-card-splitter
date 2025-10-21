import { PasswordResetToken } from "../entities/passwordResetToken.ts";

interface I_PasswordResetTokenRepository {
  save(token: PasswordResetToken): Promise<void>;
  findById(id: string): Promise<PasswordResetToken | null>;
  findByUserId(userId: string): Promise<PasswordResetToken[]>;
  delete(id: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

export class PasswordResetTokenRepository
  implements I_PasswordResetTokenRepository {
  save(_token: PasswordResetToken): Promise<void> {
    return Promise.reject("Not implemented");
  }
  findById(_id: string): Promise<PasswordResetToken | null> {
    return Promise.reject("Not implemented");
  }
  findByUserId(_userId: string): Promise<PasswordResetToken[]> {
    return Promise.reject("Not implemented");
  }
  delete(_id: string): Promise<void> {
    return Promise.reject("Not implemented");
  }
  deleteExpired(): Promise<void> {
    return Promise.reject("Not implemented");
  }
}
