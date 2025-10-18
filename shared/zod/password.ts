import * as z from "zod";

export const passwordSchema = z
  .string("Password must be a string.")
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
