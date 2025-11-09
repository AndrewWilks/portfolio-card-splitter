import { assertEquals, assertExists } from "@std/assert";
import { Hono } from "hono";
import { apiAuthResetPassword } from "../../../routes/auth/api_auth_resetPassword.ts";
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
  return { authService, sessionRepo, passwordService };
}

Deno.test({
  name: "POST /api/auth/password/reset - resets password with valid token",
  fn: async () => {
    const { authService, sessionRepo, passwordService } =
      await setupAuthService();

    // Bootstrap user and create session
    const bootstrapResult = await authService.bootstrap({
      email: "user@example.com",
      password: "OldPass123!",
      firstName: "Test",
      lastName: "User",
    });

    // Request password reset
    const token = await authService.requestPasswordReset("user@example.com");

    const app = new Hono();
    app.post("/api/auth/password/reset", (c) =>
      apiAuthResetPassword(c, authService)
    );

    const res = await app.request("/api/auth/password/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token!.id,
        password: "NewPass123!",
      }),
    });

    assertEquals(res.status, 200);
    const json = await res.json();
    assertExists(json.success);
    assertEquals(json.success, true);

    // Verify password was changed (login with new password should work)
    const loginResult = await authService.login(
      "user@example.com",
      "NewPass123!"
    );
    assertExists(loginResult.user);
    assertEquals(loginResult.user.email, "user@example.com");

    // Verify old session was invalidated
    const oldSession = await sessionRepo.findById(bootstrapResult.session.id);
    assertEquals(oldSession, null);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/password/reset - rejects invalid token",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.post("/api/auth/password/reset", (c) =>
      apiAuthResetPassword(c, authService)
    );

    const res = await app.request("/api/auth/password/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: "invalid-token-id",
        password: "NewPass123!",
      }),
    });

    assertEquals(res.status, 401);
    const json = await res.json();
    assertExists(json.error);
    assertEquals(json.error.includes("Invalid"), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/password/reset - rejects used token",
  fn: async () => {
    const { authService } = await setupAuthService();

    // Bootstrap user
    await authService.bootstrap({
      email: "user@example.com",
      password: "OldPass123!",
      firstName: "Test",
      lastName: "User",
    });

    // Request password reset
    const token = await authService.requestPasswordReset("user@example.com");

    // Reset password (uses token)
    await authService.resetPassword(token!.id, "NewPass123!");

    const app = new Hono();
    app.post("/api/auth/password/reset", (c) =>
      apiAuthResetPassword(c, authService)
    );

    // Try to use token again
    const res = await app.request("/api/auth/password/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token!.id,
        password: "AnotherPass123!",
      }),
    });

    assertEquals(res.status, 401);
    const json = await res.json();
    assertExists(json.error);
    assertEquals(json.error.includes("used"), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/password/reset - rejects weak password",
  fn: async () => {
    const { authService } = await setupAuthService();

    // Bootstrap user
    await authService.bootstrap({
      email: "user@example.com",
      password: "OldPass123!",
      firstName: "Test",
      lastName: "User",
    });

    // Request password reset
    const token = await authService.requestPasswordReset("user@example.com");

    const app = new Hono();
    app.post("/api/auth/password/reset", (c) =>
      apiAuthResetPassword(c, authService)
    );

    const res = await app.request("/api/auth/password/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token!.id,
        password: "weak",
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
  name: "POST /api/auth/password/reset - validates required fields",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.post("/api/auth/password/reset", (c) =>
      apiAuthResetPassword(c, authService)
    );

    const res = await app.request("/api/auth/password/reset", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: "some-token",
        // Missing password
      }),
    });

    assertEquals(res.status, 400);
    const json = await res.json();
    assertExists(json.error);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
