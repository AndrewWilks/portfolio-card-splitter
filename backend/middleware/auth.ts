import { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { createAuthService } from "../di.ts";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const sessionId = getCookie(c, "session_id");

  if (!sessionId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const authService = createAuthService();

  try {
    const result = await authService.validateSession(sessionId);
    if (!result) {
      return c.json({ error: "Invalid session" }, 401);
    }
    c.set("user", result.user);
    c.set("session", result.session);
    await next();
  } catch {
    return c.json({ error: "Invalid session" }, 401);
  }
};
