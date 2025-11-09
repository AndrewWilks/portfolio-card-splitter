import { assertEquals, assertExists } from "@std/assert";
import { Hono } from "hono";
import { apiAuthAcceptInvite } from "../../../routes/auth/api_auth_acceptInvite.ts";
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
  name: "POST /api/auth/invite/accept - creates MEMBER user and sets cookie",
  fn: async () => {
    const { authService } = await setupAuthService();

    // Bootstrap OWNER and create invite
    const owner = await authService.bootstrap({
      email: "owner@example.com",
      password: "OwnerPass123!",
      firstName: "Owner",
      lastName: "User",
    });
    const token = await authService.invite(
      owner.user.id,
      "newuser@example.com"
    );

    const app = new Hono();
    app.post("/api/auth/invite/accept", (c) =>
      apiAuthAcceptInvite(c, authService)
    );

    const res = await app.request("/api/auth/invite/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token.id,
        password: "NewUserPass123!",
        firstName: "New",
        lastName: "User",
      }),
    });

    assertEquals(res.status, 201);
    const json = await res.json();
    assertExists(json.user);
    assertEquals(json.user.email, "newuser@example.com");
    assertEquals(json.user.role, "member");

    // Check session cookie is set
    const setCookieHeader = res.headers.get("set-cookie");
    assertExists(setCookieHeader);
    assertEquals(setCookieHeader?.includes("session_id="), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/invite/accept - rejects invalid token",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.post("/api/auth/invite/accept", (c) =>
      apiAuthAcceptInvite(c, authService)
    );

    const res = await app.request("/api/auth/invite/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: "invalid-token-id",
        password: "NewUserPass123!",
        firstName: "New",
        lastName: "User",
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
  name: "POST /api/auth/invite/accept - rejects weak password",
  fn: async () => {
    const { authService } = await setupAuthService();

    // Bootstrap and create invite
    const owner = await authService.bootstrap({
      email: "owner@example.com",
      password: "OwnerPass123!",
      firstName: "Owner",
      lastName: "User",
    });
    const token = await authService.invite(
      owner.user.id,
      "newuser@example.com"
    );

    const app = new Hono();
    app.post("/api/auth/invite/accept", (c) =>
      apiAuthAcceptInvite(c, authService)
    );

    const res = await app.request("/api/auth/invite/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: token.id,
        password: "weak",
        firstName: "New",
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
  name: "POST /api/auth/invite/accept - validates required fields",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.post("/api/auth/invite/accept", (c) =>
      apiAuthAcceptInvite(c, authService)
    );

    const res = await app.request("/api/auth/invite/accept", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token: "some-token",
        password: "NewUserPass123!",
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
