import { assertEquals, assertExists } from "@std/assert";
import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import { apiAuthBootstrap } from "../../../routes/auth/api_auth_bootstrap.ts";
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
  name: "POST /api/auth/bootstrap - creates OWNER user and sets session cookie",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.post("/api/auth/bootstrap", (c) => apiAuthBootstrap(c, authService));

    const res = await app.request("/api/auth/bootstrap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "AdminPass123!",
        firstName: "Admin",
        lastName: "User",
      }),
    });

    assertEquals(res.status, 201);
    const json = await res.json();
    assertExists(json.user);
    assertEquals(json.user.email, "admin@example.com");
    assertEquals(json.user.role, "owner");

    // Check session cookie is set
    const setCookieHeader = res.headers.get("set-cookie");
    assertExists(setCookieHeader);
    assertEquals(setCookieHeader?.includes("session_id="), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/bootstrap - rejects if users already exist",
  fn: async () => {
    const { authService } = await setupAuthService();

    // Create first user
    await authService.bootstrap({
      email: "first@example.com",
      password: "FirstPass123!",
      firstName: "First",
      lastName: "User",
    });

    const app = new Hono();
    app.post("/api/auth/bootstrap", (c) => apiAuthBootstrap(c, authService));

    const res = await app.request("/api/auth/bootstrap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "second@example.com",
        password: "SecondPass123!",
        firstName: "Second",
        lastName: "User",
      }),
    });

    assertEquals(res.status, 400);
    const json = await res.json();
    assertExists(json.error);
    assertEquals(json.error.includes("already exist"), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/bootstrap - rejects weak password",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.post("/api/auth/bootstrap", (c) => apiAuthBootstrap(c, authService));

    const res = await app.request("/api/auth/bootstrap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "weak",
        firstName: "Admin",
        lastName: "User",
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
  name: "POST /api/auth/bootstrap - rejects invalid email",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.post("/api/auth/bootstrap", (c) => apiAuthBootstrap(c, authService));

    const res = await app.request("/api/auth/bootstrap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "not-an-email",
        password: "StrongPass123!",
        firstName: "Admin",
        lastName: "User",
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
  name: "POST /api/auth/bootstrap - rejects missing required fields",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.post("/api/auth/bootstrap", (c) => apiAuthBootstrap(c, authService));

    const res = await app.request("/api/auth/bootstrap", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "StrongPass123!",
        // Missing firstName and lastName
      }),
    });

    assertEquals(res.status, 400);
    const json = await res.json();
    assertExists(json.error);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
