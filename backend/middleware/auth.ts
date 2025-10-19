import { MiddlewareHandler } from "hono";
import { createAuthService } from "../di.ts";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.substring(7);
  const authService = createAuthService();

  try {
    const result = await authService.validateSession(token);
    if (!result) {
      return c.json({ error: "Invalid session" }, 401);
    }
    c.set("user", result.user);
    await next();
  } catch {
    return c.json({ error: "Invalid session" }, 401);
  }
};
