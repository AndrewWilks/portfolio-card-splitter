import { assertEquals, assertExists } from "@std/assert";
import { Hono } from "hono";
import { apiAuthRequestReset } from "../../../routes/auth/api_auth_requestReset.ts";
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
  return { authService, passwordResetTokenRepo };
}

Deno.test({
  name: "POST /api/auth/password/reset/request - creates token for valid email",
  fn: async () => {
    const { authService, passwordResetTokenRepo } = await setupAuthService();

    // Bootstrap user
    await authService.bootstrap({
      email: "user@example.com",
      password: "UserPass123!",
      firstName: "Test",
      lastName: "User",
    });

    const app = new Hono();
    app.post("/api/auth/password/reset/request", (c) =>
      apiAuthRequestReset(c, authService)
    );

    const res = await app.request("/api/auth/password/reset/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "user@example.com",
      }),
    });

    assertEquals(res.status, 200);
    const json = await res.json();
    assertExists(json.success);
    assertEquals(json.success, true);

    // Verify token was created in database
    const tokens = await passwordResetTokenRepo.findByEmail("user@example.com");
    assertEquals(tokens.length, 1);
    assertEquals(tokens[0].email, "user@example.com");
    assertEquals(tokens[0].isUsed, false);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/password/reset/request - returns success even for non-existent email (security)",
  fn: async () => {
    const { authService, passwordResetTokenRepo } = await setupAuthService();

    const app = new Hono();
    app.post("/api/auth/password/reset/request", (c) =>
      apiAuthRequestReset(c, authService)
    );

    const res = await app.request("/api/auth/password/reset/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "nonexistent@example.com",
      }),
    });

    // Should return 200 (silent failure for security)
    assertEquals(res.status, 200);
    const json = await res.json();
    assertExists(json.success);
    assertEquals(json.success, true);

    // Verify no token was created
    const tokens = await passwordResetTokenRepo.findByEmail(
      "nonexistent@example.com"
    );
    assertEquals(tokens.length, 0);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/password/reset/request - validates email format",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.post("/api/auth/password/reset/request", (c) =>
      apiAuthRequestReset(c, authService)
    );

    const res = await app.request("/api/auth/password/reset/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "not-an-email",
      }),
    });

    assertEquals(res.status, 400);
    const json = await res.json();
    assertExists(json.error);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/password/reset/request - validates required fields",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.post("/api/auth/password/reset/request", (c) =>
      apiAuthRequestReset(c, authService)
    );

    const res = await app.request("/api/auth/password/reset/request", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    assertEquals(res.status, 400);
    const json = await res.json();
    assertExists(json.error);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
