import { string } from "zod";

// TODO: Password hashing must not live in shared, User imports PasswordService. The shared layer should not depend on any crypto or environment specific APIs. Move hashing to a backend service behind a port interface, keep only a password policy validator in shared if you need it.

export class PasswordService {
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

  static async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  static async verifyPassword(
    password: string,
    hashedPassword: string
  ): Promise<boolean> {
    const hash = await this.hashPassword(password);
    return hash === hashedPassword;
  }

  static validatePassword(password: string) {
    return this.schema.safeParse(password);
  }
}
