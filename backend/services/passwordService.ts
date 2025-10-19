import { PasswordService as SharedPasswordService } from "@shared/services";
import { ZodSafeParseResult } from "zod";

export class PasswordService extends SharedPasswordService {
  static override hashPassword(_password: string): string {
    // TODO: Implement hashPassword method to hash password
    throw new Error("Not implemented");
  }

  static override verifyPassword(
    _password: string,
    _hashedPassword: string
  ): boolean {
    // TODO: Implement verifyPassword method to verify password against hash
    throw new Error("Not implemented");
  }

  static override validatePassword(
    _password: string
  ): ZodSafeParseResult<string> {
    // TODO: Implement validatePassword method to validate password schema
    throw new Error("Not implemented");
  }
}
