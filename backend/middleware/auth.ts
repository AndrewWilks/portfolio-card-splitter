import { MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { AuthService } from "../services/authService.ts";
import { UserRole } from "../../shared/entities/user.ts";

/**
 * Middleware to require authentication
 * Validates session cookie and attaches user to context
 */
export function requireAuth(authService: AuthService): MiddlewareHandler {
  return async (c, next) => {
    const sessionId = getCookie(c, "session_id");

    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

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
}

/**
 * Middleware to require OWNER role
 * Must be used after requireAuth or will check auth first
 */
export function requireOwner(authService: AuthService): MiddlewareHandler {
  return async (c, next) => {
    const sessionId = getCookie(c, "session_id");

    if (!sessionId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    try {
      const result = await authService.validateSession(sessionId);
      if (!result) {
        return c.json({ error: "Invalid session" }, 401);
      }

      // Check if user has OWNER role
      if (result.user.role !== UserRole.OWNER) {
        return c.json({ error: "Forbidden - OWNER role required" }, 403);
      }

      c.set("user", result.user);
      c.set("session", result.session);
      await next();
    } catch {
      return c.json({ error: "Invalid session" }, 401);
    }
  };
}

// Legacy export for backwards compatibility
export const authMiddleware = requireAuth;
