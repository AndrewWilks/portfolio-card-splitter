import { assertEquals, assertExists } from "@std/assert";
import { Hono } from "hono";
import { apiAuthInvite } from "../../../routes/auth/api_auth_invite.ts";
import { requireOwner } from "../../../middleware/auth.ts";
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
  name: "POST /api/auth/invite - OWNER can invite user and get token",
  fn: async () => {
    const { authService } = await setupAuthService();

    // Bootstrap OWNER user
    const owner = await authService.bootstrap({
      email: "owner@example.com",
      password: "OwnerPass123!",
      firstName: "Owner",
      lastName: "User",
    });

    const app = new Hono();
    app.use("/api/auth/invite", requireOwner(authService));
    app.post("/api/auth/invite", (c) => apiAuthInvite(c, authService));

    const res = await app.request("/api/auth/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_id=${owner.session.id}`,
      },
      body: JSON.stringify({
        email: "newuser@example.com",
      }),
    });

    assertEquals(res.status, 201);
    const json = await res.json();
    assertExists(json.token);
    assertExists(json.expiresAt);
    assertEquals(json.email, "newuser@example.com");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/invite - requires OWNER role (rejects MEMBER)",
  fn: async () => {
    const { authService } = await setupAuthService();

    // Bootstrap OWNER
    const owner = await authService.bootstrap({
      email: "owner@example.com",
      password: "OwnerPass123!",
      firstName: "Owner",
      lastName: "User",
    });

    // Invite and create MEMBER
    const inviteToken = await authService.invite(
      owner.user.id,
      "member@example.com"
    );
    const member = await authService.acceptInvite(inviteToken.id, {
      password: "MemberPass123!",
      firstName: "Member",
      lastName: "User",
    });

    const app = new Hono();
    app.use("/api/auth/invite", requireOwner(authService));
    app.post("/api/auth/invite", (c) => apiAuthInvite(c, authService));

    const res = await app.request("/api/auth/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_id=${member.session.id}`,
      },
      body: JSON.stringify({
        email: "another@example.com",
      }),
    });

    assertEquals(res.status, 403);
    const json = await res.json();
    assertExists(json.error);
    assertEquals(json.error, "Forbidden - OWNER role required");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/invite - requires authentication",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.use("/api/auth/invite", requireOwner(authService));
    app.post("/api/auth/invite", (c) => apiAuthInvite(c, authService));

    const res = await app.request("/api/auth/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // No cookie
      },
      body: JSON.stringify({
        email: "newuser@example.com",
      }),
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
  name: "POST /api/auth/invite - rejects duplicate email",
  fn: async () => {
    const { authService } = await setupAuthService();

    // Bootstrap with email
    const owner = await authService.bootstrap({
      email: "owner@example.com",
      password: "OwnerPass123!",
      firstName: "Owner",
      lastName: "User",
    });

    const app = new Hono();
    app.use("/api/auth/invite", requireOwner(authService));
    app.post("/api/auth/invite", (c) => apiAuthInvite(c, authService));

    // Try to invite existing email
    const res = await app.request("/api/auth/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_id=${owner.session.id}`,
      },
      body: JSON.stringify({
        email: "owner@example.com",
      }),
    });

    assertEquals(res.status, 409);
    const json = await res.json();
    assertExists(json.error);
    assertEquals(json.error.includes("already"), true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "POST /api/auth/invite - validates email format",
  fn: async () => {
    const { authService } = await setupAuthService();

    const owner = await authService.bootstrap({
      email: "owner@example.com",
      password: "OwnerPass123!",
      firstName: "Owner",
      lastName: "User",
    });

    const app = new Hono();
    app.use("/api/auth/invite", requireOwner(authService));
    app.post("/api/auth/invite", (c) => apiAuthInvite(c, authService));

    const res = await app.request("/api/auth/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `session_id=${owner.session.id}`,
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
