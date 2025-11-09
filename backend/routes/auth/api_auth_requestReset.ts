import { Context } from "hono";
import { email, object } from "zod";
import { STATUS_CODE } from "@std/http";
import { AuthService } from "@backend/services";

const RequestResetSchema = object({
  email: email(),
});

interface RequestResetResponseSchema {
  success: true;
}

export async function apiAuthRequestReset(
  c: Context,
  authService: AuthService
) {
  // Parse and validate request body
  const parseResult = RequestResetSchema.safeParse(await c.req.json());

  // Validate request body
  if (!parseResult.success) {
    return c.json({ error: parseResult.error }, STATUS_CODE.BadRequest);
  }

  // Extract validated data
  const { email } = parseResult.data;

  try {
    // Request password reset (returns null for non-existent emails, but we don't tell the client)
    await authService.requestPasswordReset(email);

    // Always return success for security (don't leak user existence)
    return c.json<RequestResetResponseSchema>(
      { success: true },
      STATUS_CODE.OK
    );
  } catch (error) {
    // Log error server-side but return generic message
    console.error("Password reset request error:", error);
    return c.json(
      { error: "Failed to process password reset request" },
      STATUS_CODE.InternalServerError
    );
  }
}
