import { assertEquals, assertExists } from "@std/assert";
import { Hono } from "hono";
import { apiAuthLogout } from "../../../routes/auth/api_auth_logout.ts";
import { requireAuth } from "../../../middleware/auth.ts";
import { AuthService } from "../../../services/authService.ts";
import { UserRepository } from "../../../repositories/userRepository.ts";
import { SessionRepository } from "../../../repositories/sessionRepository.ts";
import { InviteTokenRepository } from "../../../repositories/inviteTokenRepository.ts";
import { PasswordResetTokenRepository } from "../../../repositories/passwordResetTokenRepository.ts";
import { EventRepository } from "../../../repositories/eventRepository.ts";
import { PasswordService } from "../../../services/passwordService.ts";
import { SessionService } from "../../../services/sessionService.ts";
import { clearAllData } from "../../testHelpers.ts";

async function setupAuthService() {
  await clearAllData();
  const userRepo = new UserRepository();
  const sessionRepo = new SessionRepository();
  const inviteTokenRepo = new InviteTokenRepository();
  const passwordResetTokenRepo = new PasswordResetTokenRepository();
  const eventRepo = new EventRepository();
  const passwordService = new PasswordService();
  const sessionService = new SessionService(sessionRepo);
  const authService = new AuthService(
    userRepo,
    sessionRepo,
    inviteTokenRepo,
    passwordResetTokenRepo,
    eventRepo,
    passwordService,
    sessionService
  );
  return { authService, sessionRepo };
}

Deno.test({
  name: "POST /api/auth/logout - successfully logs out and clears cookie",
  fn: async () => {
    const { authService, sessionRepo } = await setupAuthService();

    // Bootstrap and get session
    const result = await authService.bootstrap({
      email: "user@example.com",
      password: "UserPass123!",
      firstName: "Test",
      lastName: "User",
    });

    const app = new Hono();
    app.use("/api/auth/logout", requireAuth(authService));
    app.post("/api/auth/logout", (c) => apiAuthLogout(c, authService));

    const res = await app.request("/api/auth/logout", {
      method: "POST",
      headers: {
        Cookie: `session_id=${result.session.id}`,
      },
    });

    assertEquals(res.status, 204);

    // Check session cookie is cleared
    const setCookieHeader = res.headers.get("set-cookie");
    assertExists(setCookieHeader);
    assertEquals(setCookieHeader?.includes("session_id=;"), true);
    assertEquals(setCookieHeader?.includes("Max-Age=0"), true);

    // Verify session deleted from database
    const session = await sessionRepo.findById(result.session.id);
    assertEquals(session, null);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/logout - requires authentication",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.use("/api/auth/logout", requireAuth(authService));
    app.post("/api/auth/logout", (c) => apiAuthLogout(c, authService));

    const res = await app.request("/api/auth/logout", {
      method: "POST",
      // No cookie provided
    });

    assertEquals(res.status, 401);
    const json = await res.json();
    assertExists(json.error);
    assertEquals(json.error, "Unauthorized");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/logout - rejects invalid session",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.use("/api/auth/logout", requireAuth(authService));
    app.post("/api/auth/logout", (c) => apiAuthLogout(c, authService));

    const res = await app.request("/api/auth/logout", {
      method: "POST",
      headers: {
        Cookie: "session_id=invalid-session-id",
      },
    });

    assertEquals(res.status, 401);
    const json = await res.json();
    assertExists(json.error);
    assertEquals(json.error, "Invalid session");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
