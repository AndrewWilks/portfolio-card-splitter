import { string } from "zod";
import { hash, verify } from "@stdext/crypto/hash";

export class PasswordService {
  private static readonly hashConfig = {
    name: "argon2",
    algorithm: "argon2i",
  };

  static readonly schema = string("Password must be a string.")
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password must be at most 128 characters long.")
    .refine(
      (val) => {
        // At least one uppercase letter, one lowercase letter, one number, and one special character
        const hasUpperCase = /[A-Z]/.test(val);
        const hasLowerCase = /[a-z]/.test(val);
        const hasNumber = /[0-9]/.test(val);
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(val);
        return hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;
      },
      {
        message:
          "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      }
    );

  static hashPassword(password: string): string {
    return hash(this.hashConfig, password);
  }

  static verifyPassword(password: string, hashedPassword: string): boolean {
    return verify(this.hashConfig, password, hashedPassword);
  }

  static validatePassword(password: string) {
    return this.schema.safeParse(password);
  }
}
