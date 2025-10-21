import { Context } from "hono";
import { string, email, object } from "zod";
import { STATUS_CODE } from "@std/http";
import { PasswordService } from "@shared/services";
import { AuthService } from "@backend/services";

const BootstrapRequestSchema = object({
  firstName: string().min(2),
  laseName: string().min(2),
  email: email(),
  password: PasswordService.schema,
});

interface BootstrapResponseSchema {
  success: true;
  user: {
    id: string;
    email: string;
    firstName: string;
    laseName: string;
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
  const { laseName, firstName, email, password } = parseResult.data;

  try {
    // Use authService.bootstrap to create the admin user
    const result = await authService.bootstrap({
      email,
      password,
      firstName,
      lastName: laseName,
    });

    return c.json<BootstrapResponseSchema>({
      success: true,
      user: {
        id: result.user.id,
        email: result.user.email,
        firstName: result.user.firstName,
        laseName: result.user.lastName,
        isActive: true,
      },
      message: "Admin user created successfully",
    });
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      STATUS_CODE.BadRequest
    );
  }
}
