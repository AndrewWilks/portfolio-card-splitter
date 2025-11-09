import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { email, object, string } from "zod";
import { STATUS_CODE } from "@std/http";
import { AuthService } from "@backend/services";

const LoginRequestSchema = object({
  email: email(),
  password: string().min(1),
});

interface LoginResponseSchema {
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

export async function apiAuthLogin(c: Context, authService: AuthService) {
  // Parse and validate request body
  const parseResult = LoginRequestSchema.safeParse(await c.req.json());

  // Validate request body
  if (!parseResult.success) {
    return c.json({ error: parseResult.error }, STATUS_CODE.BadRequest);
  }

  // Extract validated data
  const { email, password } = parseResult.data;

  try {
    // Use authService.login to authenticate
    const result = await authService.login(email, password);

    // Set session cookie
    setCookie(c, "session_id", result.session.id, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 60 * 60 * 24, // 24 hours
    });

    return c.json<LoginResponseSchema>({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        lastName: result.user.lastName,
        role: result.user.role,
        isActive: result.user.isActive,
      },
    });
  } catch (error) {
    // Login errors should return 401 Unauthorized
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      STATUS_CODE.Unauthorized
    );
  }
}
