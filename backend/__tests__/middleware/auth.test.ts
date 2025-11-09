import { assertEquals } from "@std/assert";
import { Hono } from "hono";
import { requireAuth, requireOwner } from "../../middleware/auth.ts";
import { AuthService } from "../../services/authService.ts";
import { UserRepository } from "../../repositories/userRepository.ts";
import { SessionRepository } from "../../repositories/sessionRepository.ts";
import { InviteTokenRepository } from "../../repositories/inviteTokenRepository.ts";
import { PasswordResetTokenRepository } from "../../repositories/passwordResetTokenRepository.ts";
import { EventRepository } from "../../repositories/eventRepository.ts";
import { PasswordService } from "../../services/passwordService.ts";
import { SessionService } from "../../services/sessionService.ts";
import { clearAllData } from "../testHelpers.ts";
import { User, Session } from "../../../shared/entities/index.ts";

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
  name: "requireAuth - allows request with valid session",
  fn: async () => {
    const { authService } = await setupAuthService();

    // Create user and session
    const { user, session } = await authService.bootstrap({
      email: "test@example.com",
      password: "TestPass123!",
      firstName: "Test",
      lastName: "User",
    });

    // Create test app
    const app = new Hono();
    app.use("/protected", requireAuth(authService));
    app.get("/protected", (c) => {
      const user = c.get("user") as User;
      return c.json({ userId: user.id });
    });

    // Make request with session cookie
    const res = await app.request("/protected", {
      headers: {
        Cookie: `session_id=${session.id}`,
      },
    });

    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(json.userId, user.id);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "requireAuth - rejects request without session cookie",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.use("/protected", requireAuth(authService));
    app.get("/protected", (c) => c.json({ success: true }));

    const res = await app.request("/protected");

    assertEquals(res.status, 401);
    const json = await res.json();
    assertEquals(json.error, "Unauthorized");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "requireAuth - rejects request with invalid session",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.use("/protected", requireAuth(authService));
    app.get("/protected", (c) => c.json({ success: true }));

    const res = await app.request("/protected", {
      headers: {
        Cookie: "session_id=invalid-session-id",
      },
    });

    assertEquals(res.status, 401);
    const json = await res.json();
    assertEquals(json.error, "Invalid session");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "requireAuth - attaches user and session to context",
  fn: async () => {
    const { authService } = await setupAuthService();

    const { user, session } = await authService.bootstrap({
      email: "test@example.com",
      password: "TestPass123!",
      firstName: "Test",
      lastName: "User",
    });

    const app = new Hono();
    app.use("/protected", requireAuth(authService));
    app.get("/protected", (c) => {
      const contextUser = c.get("user") as User;
      const contextSession = c.get("session") as Session;
      return c.json({
        hasUser: !!contextUser,
        hasSession: !!contextSession,
        userId: contextUser.id,
        sessionId: contextSession.id,
      });
    });

    const res = await app.request("/protected", {
      headers: {
        Cookie: `session_id=${session.id}`,
      },
    });

    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(json.hasUser, true);
    assertEquals(json.hasSession, true);
    assertEquals(json.userId, user.id);
    assertEquals(json.sessionId, session.id);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "requireOwner - allows OWNER user",
  fn: async () => {
    const { authService } = await setupAuthService();

    const { user, session } = await authService.bootstrap({
      email: "owner@example.com",
      password: "OwnerPass123!",
      firstName: "Owner",
      lastName: "User",
    });

    const app = new Hono();
    app.use("/admin", requireOwner(authService));
    app.get("/admin", (c) => c.json({ success: true }));

    const res = await app.request("/admin", {
      headers: {
        Cookie: `session_id=${session.id}`,
      },
    });

    assertEquals(res.status, 200);
    const json = await res.json();
    assertEquals(json.success, true);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "requireOwner - rejects MEMBER user",
  fn: async () => {
    const { authService } = await setupAuthService();

    // Create OWNER first
    const owner = await authService.bootstrap({
      email: "owner@example.com",
      password: "OwnerPass123!",
      firstName: "Owner",
      lastName: "User",
    });

    // Create invite and accept as MEMBER
    const inviteToken = await authService.invite(
      owner.user.id,
      "member@example.com"
    );
    const member = await authService.acceptInvite(inviteToken.token, {
      password: "MemberPass123!",
      firstName: "Member",
      lastName: "User",
    });

    const app = new Hono();
    app.use("/admin", requireOwner(authService));
    app.get("/admin", (c) => c.json({ success: true }));

    const res = await app.request("/admin", {
      headers: {
        Cookie: `session_id=${member.session.id}`,
      },
    });

    assertEquals(res.status, 403);
    const json = await res.json();
    assertEquals(json.error, "Forbidden - OWNER role required");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "requireOwner - rejects unauthenticated request",
  fn: async () => {
    const { authService } = await setupAuthService();

    const app = new Hono();
    app.use("/admin", requireOwner(authService));
    app.get("/admin", (c) => c.json({ success: true }));

    const res = await app.request("/admin");

    assertEquals(res.status, 401);
    const json = await res.json();
    assertEquals(json.error, "Unauthorized");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
