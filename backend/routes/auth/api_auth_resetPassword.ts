import { Context } from "hono";
import { object, string } from "zod";
import { STATUS_CODE } from "@std/http";
import { PasswordService } from "@shared/services";
import { AuthService } from "@backend/services";

const ResetPasswordSchema = object({
  token: string().min(1),
  password: PasswordService.schema,
});

interface ResetPasswordResponseSchema {
  success: true;
}

export async function apiAuthResetPassword(
  c: Context,
  authService: AuthService
) {
  // Parse and validate request body
  const parseResult = ResetPasswordSchema.safeParse(await c.req.json());

  // Validate request body
  if (!parseResult.success) {
    return c.json({ error: parseResult.error }, STATUS_CODE.BadRequest);
  }

  // Extract validated data
  const { token, password } = parseResult.data;

  try {
    // Reset password with token
    await authService.resetPassword(token, password);

    return c.json<ResetPasswordResponseSchema>(
      { success: true },
      STATUS_CODE.OK
    );
  } catch (error) {
    // Check for specific error types
    if (
      error instanceof Error &&
      (error.message.includes("Invalid") ||
        error.message.includes("expired") ||
        error.message.includes("used"))
    ) {
      return c.json({ error: error.message }, STATUS_CODE.Unauthorized);
    }

    // Validation errors (weak password)
    if (error instanceof Error && error.message.includes("Weak password")) {
      return c.json({ error: error.message }, STATUS_CODE.BadRequest);
    }

    // Generic error
    return c.json(
      { error: "Failed to reset password" },
      STATUS_CODE.InternalServerError
    );
  }
}
