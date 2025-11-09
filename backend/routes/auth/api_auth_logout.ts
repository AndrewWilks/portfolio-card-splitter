import { Context } from "hono";
import { deleteCookie, getCookie } from "hono/cookie";
import { STATUS_CODE } from "@std/http";
import { AuthService } from "@backend/services";

export async function apiAuthLogout(c: Context, authService: AuthService) {
  // Get session ID from cookie (should be validated by requireAuth middleware)
  const sessionId = getCookie(c, "session_id");

  if (!sessionId) {
    return c.json({ error: "No session found" }, STATUS_CODE.BadRequest);
  }

  try {
    // Logout via authService (deletes session and emits event)
    await authService.logout(sessionId);

    // Clear session cookie
    deleteCookie(c, "session_id", {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
    });

    // Return 204 No Content (standard for successful logout)
    return c.body(null, STATUS_CODE.NoContent);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      STATUS_CODE.InternalServerError
    );
  }
}
