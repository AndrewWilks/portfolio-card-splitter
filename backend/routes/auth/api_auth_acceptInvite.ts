import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { object, string } from "zod";
import { STATUS_CODE } from "@std/http";
import { PasswordService } from "@shared/services";
import { AuthService } from "@backend/services";

const AcceptInviteRequestSchema = object({
  token: string().min(1),
  password: PasswordService.schema,
  firstName: string().min(1),
  lastName: string().min(1),
});

interface AcceptInviteResponseSchema {
  success: true;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
  };
}

export async function apiAuthAcceptInvite(
  c: Context,
  authService: AuthService
) {
  // Parse and validate request body
  const parseResult = AcceptInviteRequestSchema.safeParse(await c.req.json());

  // Validate request body
  if (!parseResult.success) {
    return c.json({ error: parseResult.error }, STATUS_CODE.BadRequest);
  }

  // Extract validated data
  const { token, password, firstName, lastName } = parseResult.data;

  try {
    // Use authService.acceptInvite to create user
    const result = await authService.acceptInvite(token, {
      password,
      firstName,
      lastName,
    });

    // Set session cookie
    setCookie(c, "session_id", result.session.id, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return c.json<AcceptInviteResponseSchema>(
      {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          isActive: result.user.isActive,
        },
      },
      STATUS_CODE.Created
    );
  } catch (error) {
    // Token errors should return 401
    if (
      error instanceof Error &&
      (error.message.includes("Invalid") ||
        error.message.includes("expired") ||
        error.message.includes("used"))
    ) {
      return c.json({ error: error.message }, STATUS_CODE.Unauthorized);
    }

    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      STATUS_CODE.BadRequest
    );
  }
}
