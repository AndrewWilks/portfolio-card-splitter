import { Context } from "hono";
import { email, object } from "zod";
import { STATUS_CODE } from "@std/http";
import { AuthService } from "@backend/services";
import { User } from "@shared/entities";

const InviteRequestSchema = object({
  email: email(),
});

interface InviteResponseSchema {
  success: true;
  token: string;
  email: string;
  expiresAt: string;
}

export async function apiAuthInvite(c: Context, authService: AuthService) {
  // Parse and validate request body
  const parseResult = InviteRequestSchema.safeParse(await c.req.json());

  // Validate request body
  if (!parseResult.success) {
    return c.json({ error: parseResult.error }, STATUS_CODE.BadRequest);
  }

  // Extract validated data
  const { email } = parseResult.data;

  try {
    // Get user from context (set by requireOwner middleware)
    const user = c.get("user") as User;

    // Use authService.invite to create token
    const token = await authService.invite(user.id, email);

    return c.json<InviteResponseSchema>(
      {
        success: true,
        token: token.id,
        email: token.email,
        expiresAt: token.expiresAt.toISOString(),
      },
      STATUS_CODE.Created
    );
  } catch (error) {
    // Check for specific error types
    if (error instanceof Error && error.message.includes("already")) {
      return c.json({ error: error.message }, STATUS_CODE.Conflict);
    }

    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      STATUS_CODE.BadRequest
    );
  }
}
