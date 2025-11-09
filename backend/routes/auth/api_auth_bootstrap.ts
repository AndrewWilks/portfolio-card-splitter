import { Context } from "hono";
import { setCookie } from "hono/cookie";
import { email, object, string } from "zod";
import { STATUS_CODE } from "@std/http";
import { PasswordService } from "@shared/services";
import { AuthService } from "@backend/services";

const BootstrapRequestSchema = object({
  firstName: string().min(2),
  lastName: string().min(2),
  email: email(),
  password: PasswordService.schema,
});

interface BootstrapResponseSchema {
  success: true;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: true;
  };
  message: string;
}

export async function apiAuthBootstrap(c: Context, authService: AuthService) {
  // Parse and validate request body
  const parseResult = BootstrapRequestSchema.safeParse(await c.req.json());

  // Validate request body
  if (!parseResult.success) {
    return c.json({ error: parseResult.error }, STATUS_CODE.BadRequest);
  }

  // Extract validated data
  const { lastName, firstName, email, password } = parseResult.data;

  try {
    // Use authService.bootstrap to create the admin user
    const result = await authService.bootstrap({
      email,
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

    return c.json<BootstrapResponseSchema>(
      {
        success: true,
        user: {
          id: result.user.id,
          email: result.user.email,
          firstName: result.user.firstName,
          lastName: result.user.lastName,
          role: result.user.role,
          isActive: true,
        },
        message: "Admin user created successfully",
      },
      STATUS_CODE.Created,
    );
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      STATUS_CODE.BadRequest,
    );
  }
}
