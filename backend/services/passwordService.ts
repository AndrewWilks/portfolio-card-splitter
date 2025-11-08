import bcrypt from "bcryptjs";

/**
 * PasswordService - Handles password hashing, verification, and strength validation
 * 
 * Uses bcrypt for secure password hashing with 10 cost factor (salt rounds).
 * Enforces password strength requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * - At least 1 special character
 */
export class PasswordService {
  private readonly saltRounds = 10;

  /**
   * Hash a plain text password using bcrypt
   * @param password - The plain text password to hash
   * @returns Promise resolving to the bcrypt hash
   */
  async hash(password: string): Promise<string> {
    // bcryptjs hash is synchronous, but we wrap in Promise for API consistency
    return bcrypt.hashSync(password, this.saltRounds);
  }

  /**
   * Verify a plain text password against a bcrypt hash
   * @param password - The plain text password to verify
   * @param passwordHash - The bcrypt hash to compare against
   * @returns Promise resolving to true if password matches, false otherwise
   */
  async verify(password: string, passwordHash: string): Promise<boolean> {
    try {
      // bcryptjs compare is synchronous
      return bcrypt.compareSync(password, passwordHash);
    } catch (error) {
      // If hash is invalid or comparison fails, return false instead of throwing
      console.error("Password verification error:", error);
      return false;
    }
  }

  /**
   * Validate password meets strength requirements
   * @param password - The password to validate
   * @returns true if password meets all requirements, false otherwise
   */
  validateStrength(password: string): boolean {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false; // uppercase
    if (!/[a-z]/.test(password)) return false; // lowercase
    if (!/[0-9]/.test(password)) return false; // number
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false; // special char
    return true;
  }

  /**
   * Get detailed password strength validation results
   * @param password - The password to validate
   * @returns Object with valid flag and array of error messages
   */
  getStrengthValidation(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least one uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least one lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least one number");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push("Password must contain at least one special character");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
