import { assertEquals, assertExists, assertRejects } from "@std/assert";
import { AuthService } from "../../services/authService.ts";
import { UserRepository } from "../../repositories/userRepository.ts";
import { SessionRepository } from "../../repositories/sessionRepository.ts";
import { InviteTokenRepository } from "../../repositories/inviteTokenRepository.ts";
import { PasswordResetTokenRepository } from "../../repositories/passwordResetTokenRepository.ts";
import { EventRepository } from "../../repositories/eventRepository.ts";
import { PasswordService } from "../../services/passwordService.ts";
import { SessionService } from "../../services/sessionService.ts";
import { clearAllData } from "../testHelpers.ts";
import { UserRole } from "../../../shared/entities/user.ts";

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
  return {
    authService,
    userRepo,
    sessionRepo,
    inviteTokenRepo,
    passwordResetTokenRepo,
    eventRepo,
    sessionService,
  };
}

Deno.test({
  name: "AuthService - bootstrap() creates OWNER user and session",
  fn: async () => {
    const { authService } = await setupAuthService();
    const result = await authService.bootstrap({
      email: "admin@example.com",
      password: "AdminPass123!",
      firstName: "Admin",
      lastName: "User",
    });
    assertExists(result.user);
    assertExists(result.session);
    assertEquals(result.user.email, "admin@example.com");
    assertEquals(result.user.role, UserRole.OWNER);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "AuthService - bootstrap() rejects if users exist",
  fn: async () => {
    const { authService } = await setupAuthService();
    await authService.bootstrap({
      email: "admin@example.com",
      password: "AdminPass123!",
      firstName: "Admin",
      lastName: "User",
    });
    await assertRejects(
      () =>
        authService.bootstrap({
          email: "admin2@example.com",
          password: "AdminPass123!",
          firstName: "Admin",
          lastName: "Two",
        }),
      Error,
      "already exist"
    );
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "AuthService - login() succeeds with valid credentials",
  fn: async () => {
    const { authService } = await setupAuthService();
    await authService.bootstrap({
      email: "user@example.com",
      password: "UserPass123!",
      firstName: "Test",
      lastName: "User",
    });
    const result = await authService.login("user@example.com", "UserPass123!");
    assertExists(result.user);
    assertExists(result.session);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "AuthService - login() fails with invalid email",
  fn: async () => {
    const { authService } = await setupAuthService();
    await assertRejects(
      () => authService.login("nonexistent@example.com", "password"),
      Error,
      "Invalid credentials"
    );
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "AuthService - logout() deletes session",
  fn: async () => {
    const { authService, sessionRepo } = await setupAuthService();
    const result = await authService.bootstrap({
      email: "user@example.com",
      password: "UserPass123!",
      firstName: "Test",
      lastName: "User",
    });
    await authService.logout(result.session.id);
    const session = await sessionRepo.findById(result.session.id);
    assertEquals(session, null);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "AuthService - validateSession() returns user and session",
  fn: async () => {
    const { authService } = await setupAuthService();
    const result = await authService.bootstrap({
      email: "user@example.com",
      password: "UserPass123!",
      firstName: "Test",
      lastName: "User",
    });
    const validated = await authService.validateSession(result.session.id);
    assertExists(validated);
    assertEquals(validated.user.id, result.user.id);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "AuthService - invite() creates token for OWNER",
  fn: async () => {
    const { authService } = await setupAuthService();
    const owner = await authService.bootstrap({
      email: "owner@example.com",
      password: "OwnerPass123!",
      firstName: "Owner",
      lastName: "User",
    });
    const token = await authService.invite(
      owner.user.id,
      "invitee@example.com"
    );
    assertExists(token);
    assertEquals(token.email, "invitee@example.com");
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "AuthService - acceptInvite() creates MEMBER user",
  fn: async () => {
    const { authService } = await setupAuthService();
    const owner = await authService.bootstrap({
      email: "owner@example.com",
      password: "OwnerPass123!",
      firstName: "Owner",
      lastName: "User",
    });
    const token = await authService.invite(
      owner.user.id,
      "invitee@example.com"
    );
    const result = await authService.acceptInvite(token.token, {
      password: "InviteePass123!",
      firstName: "New",
      lastName: "User",
    });
    assertExists(result.user);
    assertEquals(result.user.role, UserRole.MEMBER);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "AuthService - requestPasswordReset() creates token",
  fn: async () => {
    const { authService } = await setupAuthService();
    await authService.bootstrap({
      email: "user@example.com",
      password: "UserPass123!",
      firstName: "Test",
      lastName: "User",
    });
    const token = await authService.requestPasswordReset("user@example.com");
    assertExists(token);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});

Deno.test({
  name: "AuthService - resetPassword() updates password",
  fn: async () => {
    const { authService } = await setupAuthService();
    await authService.bootstrap({
      email: "user@example.com",
      password: "OldPass123!",
      firstName: "Test",
      lastName: "User",
    });
    const resetToken = await authService.requestPasswordReset(
      "user@example.com"
    );
    assertExists(resetToken);
    await authService.resetPassword(resetToken.token, "NewPass456!");
    const loginResult = await authService.login(
      "user@example.com",
      "NewPass456!"
    );
    assertExists(loginResult.user);
  },
  sanitizeResources: false,
  sanitizeOps: false,
});
