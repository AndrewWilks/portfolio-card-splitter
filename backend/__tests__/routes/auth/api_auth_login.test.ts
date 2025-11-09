import { assertEquals, assertExists } from "@std/assert";
import { Hono } from "hono";
import { apiAuthLogin } from "../../../routes/auth/api_auth_login.ts";
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
  return { authService };
}

Deno.test({
  name: "POST /api/auth/login - succeeds with valid credentials and sets cookie",
  fn: async () => {
    const { authService } = await setupAuthService();

    // First bootstrap a user
    await authService.bootstrap({
      email: "user@example.com",
      password: "UserPass123!",
      firstName: "Test",
      lastName: "User",
    });

    const app = new Hono();
    app.post("/api/auth/login", (c) => apiAuthLogin(c, authService));

    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "user@example.com",
        password: "UserPass123!",
      }),
    });

    assertEquals(res.status, 200);
    const json = await res.json();
    assertExists(json.user);
    assertEquals(json.user.email, "user@example.com");

    // Check session cookie is set
    const setCookieHeader = res.headers.get("set-cookie");
    assertExists(setCookieHeader);
    assertEquals(setCookieHeader?.includes("session_id="), true);
    assertEquals(setCookieHeader?.includes("HttpOnly"), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/login - fails with invalid email",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.post("/api/auth/login", (c) => apiAuthLogin(c, authService));

    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "nonexistent@example.com",
        password: "SomePass123!",
      }),
    });

    assertEquals(res.status, 401);
    const json = await res.json();
    assertExists(json.error);
    assertEquals(json.error.includes("Invalid credentials"), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/login - fails with invalid password",
  fn: async () => {
    const { authService } = await setupAuthService();

    // Bootstrap a user
    await authService.bootstrap({
      email: "user@example.com",
      password: "UserPass123!",
      firstName: "Test",
      lastName: "User",
    });

    const app = new Hono();
    app.post("/api/auth/login", (c) => apiAuthLogin(c, authService));

    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "user@example.com",
        password: "WrongPassword123!",
      }),
    });

    assertEquals(res.status, 401);
    const json = await res.json();
    assertExists(json.error);
    assertEquals(json.error.includes("Invalid credentials"), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/login - validates required fields",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.post("/api/auth/login", (c) => apiAuthLogin(c, authService));

    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "user@example.com",
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
