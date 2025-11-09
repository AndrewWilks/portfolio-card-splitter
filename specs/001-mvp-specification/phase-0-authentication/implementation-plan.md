# Phase 0: Authentication - Implementation Plan

**Date**: November 8, 2025  
**Last Updated**: November 9, 2025  
**Status**: � In Progress (Tasks 0.1 & 0.2 Complete)  
**Estimated Time**: 21-29 hours (16-22 hours remaining)

---

## Overview

This plan implements authentication infrastructure in 4 sequential tasks:

1. **PasswordService** (3-4 hrs) - ✅ COMPLETE - Password hashing and validation
2. **SessionService** (2-3 hrs) - ✅ COMPLETE - Session lifecycle management
3. **AuthService** (12-16 hrs) - ✅ COMPLETE - All 8 auth operations
4. **Auth Routes** (4-6 hrs) - ✅ COMPLETE - 6 HTTP endpoints + middleware

Each task is independent and can be completed, tested, and committed separately.

---

## Task 0.1: PasswordService Implementation

**Estimated Time**: 3-4 hours  
**Actual Time**: 3 hours  
**Status**: ✅ COMPLETE (November 9, 2025)

### Goal

Implement secure password hashing, verification, and strength validation using bcrypt.

### Context

Currently `backend/services/passwordService.ts` has 3 stub methods. A working implementation exists in `shared/services/passwordService.ts` that can be referenced but backend needs its own implementation with proper DI integration.

### Files to Modify

- `backend/services/passwordService.ts`

### Files to Create

- `backend/__tests__/services/passwordService.test.ts`

### Implementation

#### backend/services/passwordService.ts

```typescript
import * as bcrypt from "bcrypt";
import { z } from "zod";

/**
 * Service for password hashing, verification, and strength validation
 */
export class PasswordService {
  private readonly saltRounds = 10;

  /**
   * Hash a plain text password using bcrypt
   * @param password Plain text password
   * @returns Bcrypt hash
   */
  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  /**
   * Verify a plain text password against a hash
   * @param password Plain text password
   * @param hash Bcrypt hash to compare against
   * @returns True if password matches hash
   */
  async verify(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      // Invalid hash format
      return false;
    }
  }

  /**
   * Validate password meets strength requirements
   * Requirements:
   * - Minimum 8 characters
   * - At least 1 uppercase letter
   * - At least 1 lowercase letter
   * - At least 1 number
   * - At least 1 special character
   *
   * @param password Password to validate
   * @returns True if password meets all requirements
   */
  validateStrength(password: string): boolean {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[^A-Za-z0-9]/.test(password)) return false;
    return true;
  }

  /**
   * Get detailed password strength validation results
   * Useful for providing feedback to users
   *
   * @param password Password to validate
   * @returns Object with validation results
   */
  getStrengthValidation(password: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }
    if (!/[A-Z]/.test(password)) {
      errors.push("Password must contain at least 1 uppercase letter");
    }
    if (!/[a-z]/.test(password)) {
      errors.push("Password must contain at least 1 lowercase letter");
    }
    if (!/[0-9]/.test(password)) {
      errors.push("Password must contain at least 1 number");
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      errors.push("Password must contain at least 1 special character");
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}
```

### Testing

#### backend/**tests**/services/passwordService.test.ts

```typescript
import { describe, it, expect } from "vitest";
import { PasswordService } from "../../services/passwordService.ts";

describe("PasswordService", () => {
  const passwordService = new PasswordService();

  describe("hash()", () => {
    it("should create a valid bcrypt hash", async () => {
      const password = "SecurePass123!";
      const hash = await passwordService.hash(password);

      expect(hash).toBeTruthy();
      expect(hash).toMatch(/^\$2[aby]\$\d{2}\$/); // bcrypt format
      expect(hash.length).toBeGreaterThan(50);
    });

    it("should create different hashes for same password (salt)", async () => {
      const password = "SecurePass123!";
      const hash1 = await passwordService.hash(password);
      const hash2 = await passwordService.hash(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verify()", () => {
    it("should verify correct password", async () => {
      const password = "SecurePass123!";
      const hash = await passwordService.hash(password);

      const result = await passwordService.verify(password, hash);
      expect(result).toBe(true);
    });

    it("should reject incorrect password", async () => {
      const password = "SecurePass123!";
      const wrongPassword = "WrongPass456!";
      const hash = await passwordService.hash(password);

      const result = await passwordService.verify(wrongPassword, hash);
      expect(result).toBe(false);
    });

    it("should handle invalid hash format gracefully", async () => {
      const result = await passwordService.verify("password", "invalid-hash");
      expect(result).toBe(false);
    });

    it("should be case-sensitive", async () => {
      const password = "SecurePass123!";
      const hash = await passwordService.hash(password);

      const result = await passwordService.verify("securepass123!", hash);
      expect(result).toBe(false);
    });
  });

  describe("validateStrength()", () => {
    it("should accept valid strong password", () => {
      const result = passwordService.validateStrength("SecurePass123!");
      expect(result).toBe(true);
    });

    it("should reject password too short", () => {
      const result = passwordService.validateStrength("Sh0rt!");
      expect(result).toBe(false);
    });

    it("should reject password without uppercase", () => {
      const result = passwordService.validateStrength("securepass123!");
      expect(result).toBe(false);
    });

    it("should reject password without lowercase", () => {
      const result = passwordService.validateStrength("SECUREPASS123!");
      expect(result).toBe(false);
    });

    it("should reject password without number", () => {
      const result = passwordService.validateStrength("SecurePass!");
      expect(result).toBe(false);
    });

    it("should reject password without special character", () => {
      const result = passwordService.validateStrength("SecurePass123");
      expect(result).toBe(false);
    });

    it("should accept password with multiple special characters", () => {
      const result = passwordService.validateStrength("Secure@Pass#123!");
      expect(result).toBe(true);
    });
  });

  describe("getStrengthValidation()", () => {
    it("should return valid for strong password", () => {
      const result = passwordService.getStrengthValidation("SecurePass123!");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should return all errors for weak password", () => {
      const result = passwordService.getStrengthValidation("weak");
      expect(result.valid).toBe(false);
      expect(result.errors).toHaveLength(5);
    });

    it("should return specific errors", () => {
      const result = passwordService.getStrengthValidation("nouppercase123!");
      expect(result.valid).toBe(false);
      expect(result.errors).toContain(
        "Password must contain at least 1 uppercase letter"
      );
    });
  });
});
```

### Validation

- [x] All 15+ tests passing
- [x] Can hash passwords (bcrypt format)
- [x] Can verify correct passwords
- [x] Rejects incorrect passwords
- [x] Validates password strength correctly
- [x] Different hashes for same password (salt working)

**Completed**: November 9, 2025 - Commit 98a5b60

---

## Task 0.2: SessionService Implementation

**Estimated Time**: 2-3 hours  
**Actual Time**: 2 hours  
**Status**: ✅ COMPLETE (November 9, 2025)  
**Completed With**: Critical Repository fix for entity instance mapping

### Goal

Implement session creation, validation, and expiry calculation integrated with SessionRepository.

### Context

Currently `backend/services/sessionService.ts` has 3 static stub methods. Need to convert to instance-based service with SessionRepository dependency and implement proper session lifecycle.

### Files to Modify

- `backend/services/sessionService.ts`
- `backend/di/services.ts` (update DI container)

### Files to Create

- `backend/__tests__/services/sessionService.test.ts`

### Implementation

#### backend/services/sessionService.ts

```typescript
import { Session } from "../../shared/entities/session.ts";
import type { SessionRepository } from "../repositories/sessionRepository.ts";

/**
 * Service for session lifecycle management
 */
export class SessionService {
  constructor(private readonly sessionRepository: SessionRepository) {}

  /**
   * Create a new session for a user
   * @param userId User ID to create session for
   * @param expirationHours Hours until session expires (default 24)
   * @returns Created session
   */
  async create(userId: string, expirationHours = 24): Promise<Session> {
    const expiresAt = new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    const session = new Session({
      id: crypto.randomUUID(),
      userId,
      expiresAt,
      createdAt: new Date(),
    });

    return await this.sessionRepository.save(session);
  }

  /**
   * Check if a session is valid (not expired)
   * @param session Session to validate
   * @returns True if session is not expired
   */
  isValid(session: Session): boolean {
    return session.expiresAt > new Date();
  }

  /**
   * Calculate time until session expires
   * @param session Session to check
   * @returns Milliseconds until expiry (0 if already expired)
   */
  timeUntilExpiry(session: Session): number {
    return Math.max(0, session.expiresAt.getTime() - Date.now());
  }

  /**
   * Delete a session (for logout)
   * @param sessionId Session ID to delete
   */
  async delete(sessionId: string): Promise<void> {
    await this.sessionRepository.delete(sessionId);
  }

  /**
   * Delete all sessions for a user (for password reset)
   * @param userId User ID
   */
  async deleteAllForUser(userId: string): Promise<void> {
    const sessions = await this.sessionRepository.findByUserId(userId);
    await Promise.all(
      sessions.map((session) => this.sessionRepository.delete(session.id))
    );
  }

  /**
   * Find and validate a session by ID
   * @param sessionId Session ID
   * @returns Session if valid, null otherwise
   */
  async findValidSession(sessionId: string): Promise<Session | null> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) return null;
    if (!this.isValid(session)) {
      // Clean up expired session
      await this.delete(sessionId);
      return null;
    }
    return session;
  }
}
```

#### backend/di/services.ts

Update the SessionService instantiation:

```typescript
// Remove old static import, add instance-based
const sessionService = new SessionService(sessionRepository);
```

### Testing

#### backend/**tests**/services/sessionService.test.ts

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { SessionService } from "../../services/sessionService.ts";
import { SessionRepository } from "../../repositories/sessionRepository.ts";
import { getDbClient } from "../../db/db.client.ts";
import { clearAllData } from "../../db/helpers/clearData.ts";
import { User } from "../../../shared/entities/user.ts";
import { UserRepository } from "../../repositories/userRepository.ts";

describe("SessionService", () => {
  let sessionService: SessionService;
  let sessionRepository: SessionRepository;
  let userRepository: UserRepository;
  let testUser: User;

  beforeEach(async () => {
    const db = await getDbClient();
    await clearAllData(db);

    sessionRepository = new SessionRepository(db);
    userRepository = new UserRepository(db);
    sessionService = new SessionService(sessionRepository);

    // Create test user
    testUser = await userRepository.save(
      new User({
        id: crypto.randomUUID(),
        name: "Test User",
        email: "test@example.com",
        passwordHash: "hash",
        role: "MEMBER",
        createdAt: new Date(),
      })
    );
  });

  describe("create()", () => {
    it("should create session with default 24hr expiration", async () => {
      const session = await sessionService.create(testUser.id);

      expect(session.id).toBeTruthy();
      expect(session.userId).toBe(testUser.id);
      expect(session.expiresAt).toBeInstanceOf(Date);

      const hoursUntilExpiry =
        (session.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
      expect(hoursUntilExpiry).toBeCloseTo(24, 0);
    });

    it("should create session with custom expiration", async () => {
      const session = await sessionService.create(testUser.id, 48);

      const hoursUntilExpiry =
        (session.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60);
      expect(hoursUntilExpiry).toBeCloseTo(48, 0);
    });

    it("should save session to database", async () => {
      const session = await sessionService.create(testUser.id);
      const found = await sessionRepository.findById(session.id);

      expect(found).toBeTruthy();
      expect(found!.id).toBe(session.id);
    });
  });

  describe("isValid()", () => {
    it("should return true for non-expired session", async () => {
      const session = await sessionService.create(testUser.id, 24);
      expect(sessionService.isValid(session)).toBe(true);
    });

    it("should return false for expired session", async () => {
      // Create session that expires immediately
      const session = await sessionService.create(testUser.id, 0);

      // Wait a bit to ensure expiry
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(sessionService.isValid(session)).toBe(false);
    });
  });

  describe("timeUntilExpiry()", () => {
    it("should calculate time until expiry correctly", async () => {
      const session = await sessionService.create(testUser.id, 1);
      const timeLeft = sessionService.timeUntilExpiry(session);

      expect(timeLeft).toBeGreaterThan(0);
      expect(timeLeft).toBeLessThanOrEqual(60 * 60 * 1000); // <= 1 hour in ms
    });

    it("should return 0 for expired session", async () => {
      const session = await sessionService.create(testUser.id, 0);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const timeLeft = sessionService.timeUntilExpiry(session);
      expect(timeLeft).toBe(0);
    });
  });

  describe("delete()", () => {
    it("should delete session", async () => {
      const session = await sessionService.create(testUser.id);
      await sessionService.delete(session.id);

      const found = await sessionRepository.findById(session.id);
      expect(found).toBeNull();
    });
  });

  describe("deleteAllForUser()", () => {
    it("should delete all sessions for user", async () => {
      const session1 = await sessionService.create(testUser.id);
      const session2 = await sessionService.create(testUser.id);

      await sessionService.deleteAllForUser(testUser.id);

      const found1 = await sessionRepository.findById(session1.id);
      const found2 = await sessionRepository.findById(session2.id);

      expect(found1).toBeNull();
      expect(found2).toBeNull();
    });
  });

  describe("findValidSession()", () => {
    it("should return valid session", async () => {
      const session = await sessionService.create(testUser.id);
      const found = await sessionService.findValidSession(session.id);

      expect(found).toBeTruthy();
      expect(found!.id).toBe(session.id);
    });

    it("should return null for expired session", async () => {
      const session = await sessionService.create(testUser.id, 0);
      await new Promise((resolve) => setTimeout(resolve, 10));

      const found = await sessionService.findValidSession(session.id);
      expect(found).toBeNull();
    });

    it("should delete expired session from database", async () => {
      const session = await sessionService.create(testUser.id, 0);
      await new Promise((resolve) => setTimeout(resolve, 10));

      await sessionService.findValidSession(session.id);

      const inDb = await sessionRepository.findById(session.id);
      expect(inDb).toBeNull();
    });

    it("should return null for non-existent session", async () => {
      const found = await sessionService.findValidSession("non-existent-id");
      expect(found).toBeNull();
    });
  });
});
```

### Validation

- [x] All 12+ tests passing
- [x] Can create sessions with custom expiration
- [x] isValid() correctly identifies expired sessions
- [x] timeUntilExpiry() calculates correctly
- [x] Can delete individual sessions
- [x] Can delete all sessions for a user
- [x] findValidSession() auto-cleans expired sessions

**Completed**: November 9, 2025 - Commits 08a6d7f, a55c247

**Key Achievement**: Fixed critical bug in base Repository where insert() and update() were returning plain objects instead of entity instances, breaking entity methods.

---

## Task 0.3: AuthService Implementation

**Estimated Time**: 12-16 hours  
**Actual Time**: ~10 hours  
**Status**: ✅ COMPLETE (November 9, 2025)  
**Depends On**: Tasks 0.1 and 0.2 ✅

### Goal

Implement all 8 authentication operations with event emission and comprehensive error handling.

### Context

This is the core blocker. AuthService orchestrates User, Session, InviteToken, and PasswordResetToken repositories along with PasswordService and SessionService to provide complete auth lifecycle.

### Files to Modify

- `backend/services/authService.ts`

### Files to Create

- `backend/__tests__/services/authService.test.ts`

### Implementation

_Due to length, showing key method implementations. See full file in codebase._

#### backend/services/authService.ts (Key Methods)

```typescript
import { User, UserRole } from "../../shared/entities/user.ts";
import { Session } from "../../shared/entities/session.ts";
import { InviteToken } from "../../shared/entities/inviteToken.ts";
import { PasswordResetToken } from "../../shared/entities/passwordResetToken.ts";
import { Event } from "../../shared/entities/event.ts";
import type { UserRepository } from "../repositories/userRepository.ts";
import type { SessionRepository } from "../repositories/sessionRepository.ts";
import type { InviteTokenRepository } from "../repositories/inviteTokenRepository.ts";
import type { PasswordResetTokenRepository } from "../repositories/passwordResetTokenRepository.ts";
import type { EventRepository } from "../repositories/eventRepository.ts";
import type { PasswordService } from "./passwordService.ts";
import type { SessionService } from "./sessionService.ts";

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly inviteTokenRepository: InviteTokenRepository,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly eventRepository: EventRepository,
    private readonly passwordService: PasswordService,
    private readonly sessionService: SessionService
  ) {}

  /**
   * Bootstrap: Create first admin user
   */
  async bootstrap(
    name: string,
    email: string,
    password: string
  ): Promise<{ user: User; session: Session }> {
    // Verify no users exist
    const existingUsers = await this.userRepository.list();
    if (existingUsers.length > 0) {
      throw new Error(
        "Users already exist. Bootstrap is only for first-time setup."
      );
    }

    // Validate password strength
    if (!this.passwordService.validateStrength(password)) {
      const validation = this.passwordService.getStrengthValidation(password);
      throw new Error(`Weak password: ${validation.errors.join(", ")}`);
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(password);

    // Create admin user
    const user = await this.userRepository.save(
      new User({
        id: crypto.randomUUID(),
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: "OWNER" as UserRole,
        createdAt: new Date(),
      })
    );

    // Create session
    const session = await this.sessionService.create(user.id);

    // Emit event
    await this.eventRepository.save(
      new Event({
        id: crypto.randomUUID(),
        entityType: "user",
        entityId: user.id,
        eventType: "created",
        actorId: null, // Bootstrap has no actor
        metadata: { email: user.email, role: user.role },
        createdAt: new Date(),
      })
    );

    return { user, session };
  }

  /**
   * Login: Authenticate user and create session
   */
  async login(
    email: string,
    password: string
  ): Promise<{ user: User; session: Session }> {
    // Find user
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Verify password
    const valid = await this.passwordService.verify(
      password,
      user.passwordHash
    );
    if (!valid) {
      throw new Error("Invalid credentials");
    }

    // Create session
    const session = await this.sessionService.create(user.id);

    // Emit event
    await this.eventRepository.save(
      new Event({
        id: crypto.randomUUID(),
        entityType: "user",
        entityId: user.id,
        eventType: "login",
        actorId: user.id,
        metadata: { email: user.email },
        createdAt: new Date(),
      })
    );

    return { user, session };
  }

  /**
   * Logout: End session
   */
  async logout(sessionId: string): Promise<void> {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) return;

    // Emit event before deletion
    await this.eventRepository.save(
      new Event({
        id: crypto.randomUUID(),
        entityType: "user",
        entityId: session.userId,
        eventType: "logout",
        actorId: session.userId,
        metadata: { sessionId },
        createdAt: new Date(),
      })
    );

    await this.sessionService.delete(sessionId);
  }

  /**
   * Validate session and return user
   */
  async validateSession(
    sessionId: string
  ): Promise<{ user: User; session: Session } | null> {
    const session = await this.sessionService.findValidSession(sessionId);
    if (!session) return null;

    const user = await this.userRepository.findById(session.userId);
    if (!user) return null;

    return { user, session };
  }

  /**
   * Invite: Create invitation token (OWNER only)
   */
  async invite(email: string, inviterId: string): Promise<InviteToken> {
    // Verify inviter is OWNER
    const inviter = await this.userRepository.findById(inviterId);
    if (!inviter || inviter.role !== "OWNER") {
      throw new Error("Only OWNER can invite users");
    }

    // Check email not in use
    const existing = await this.userRepository.findByEmail(email.toLowerCase());
    if (existing) {
      throw new Error("Email already in use");
    }

    // Create token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    const token = await this.inviteTokenRepository.save(
      new InviteToken({
        id: crypto.randomUUID(),
        email: email.toLowerCase(),
        expiresAt,
        used: false,
        createdAt: new Date(),
      })
    );

    // Emit event
    await this.eventRepository.save(
      new Event({
        id: crypto.randomUUID(),
        entityType: "user",
        entityId: token.id,
        eventType: "invited",
        actorId: inviterId,
        metadata: { email, expiresAt: expiresAt.toISOString() },
        createdAt: new Date(),
      })
    );

    return token;
  }

  /**
   * Accept invite: Create user from invitation
   */
  async acceptInvite(
    tokenId: string,
    name: string,
    password: string
  ): Promise<{ user: User; session: Session }> {
    // Find token
    const token = await this.inviteTokenRepository.findById(tokenId);
    if (!token) {
      throw new Error("Invalid invitation token");
    }

    // Validate token
    if (token.used) {
      throw new Error("Invitation already used");
    }
    if (token.expiresAt < new Date()) {
      throw new Error("Invitation expired");
    }

    // Check email still available
    const existing = await this.userRepository.findByEmail(token.email);
    if (existing) {
      throw new Error("Email already in use");
    }

    // Validate password
    if (!this.passwordService.validateStrength(password)) {
      const validation = this.passwordService.getStrengthValidation(password);
      throw new Error(`Weak password: ${validation.errors.join(", ")}`);
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(password);

    // Create user
    const user = await this.userRepository.save(
      new User({
        id: crypto.randomUUID(),
        name,
        email: token.email,
        passwordHash,
        role: "MEMBER" as UserRole,
        createdAt: new Date(),
      })
    );

    // Mark token used
    token.used = true;
    await this.inviteTokenRepository.save(token);

    // Create session
    const session = await this.sessionService.create(user.id);

    // Emit event
    await this.eventRepository.save(
      new Event({
        id: crypto.randomUUID(),
        entityType: "user",
        entityId: user.id,
        eventType: "created",
        actorId: user.id,
        metadata: { email: user.email, role: user.role, fromInvite: true },
        createdAt: new Date(),
      })
    );

    return { user, session };
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(
    email: string
  ): Promise<PasswordResetToken | null> {
    // Find user (return null silently if not found - security)
    const user = await this.userRepository.findByEmail(email.toLowerCase());
    if (!user) return null;

    // Create token
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    const token = await this.passwordResetTokenRepository.save(
      new PasswordResetToken({
        id: crypto.randomUUID(),
        userId: user.id,
        expiresAt,
        used: false,
        createdAt: new Date(),
      })
    );

    return token;
  }

  /**
   * Reset password with token
   */
  async resetPassword(tokenId: string, newPassword: string): Promise<void> {
    // Find token
    const token = await this.passwordResetTokenRepository.findById(tokenId);
    if (!token) {
      throw new Error("Invalid reset token");
    }

    // Validate token
    if (token.used) {
      throw new Error("Reset token already used");
    }
    if (token.expiresAt < new Date()) {
      throw new Error("Reset token expired");
    }

    // Validate password
    if (!this.passwordService.validateStrength(newPassword)) {
      const validation =
        this.passwordService.getStrengthValidation(newPassword);
      throw new Error(`Weak password: ${validation.errors.join(", ")}`);
    }

    // Hash password
    const passwordHash = await this.passwordService.hash(newPassword);

    // Update user
    const user = await this.userRepository.findById(token.userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.passwordHash = passwordHash;
    await this.userRepository.save(user);

    // Mark token used
    token.used = true;
    await this.passwordResetTokenRepository.save(token);

    // Invalidate all sessions
    await this.sessionService.deleteAllForUser(user.id);

    // Emit event
    await this.eventRepository.save(
      new Event({
        id: crypto.randomUUID(),
        entityType: "user",
        entityId: user.id,
        eventType: "password_reset",
        actorId: user.id,
        metadata: {},
        createdAt: new Date(),
      })
    );
  }
}
```

### Testing

Create comprehensive test file covering all 8 methods with success and error cases. Approximately 30+ test cases.

### Validation

- [x] All 30+ tests passing
- [x] bootstrap() creates admin and session
- [x] bootstrap() rejects if users exist
- [x] login() works with valid credentials
- [x] login() fails with invalid credentials
- [x] logout() deletes session and emits event
- [x] validateSession() returns user+session
- [x] validateSession() returns null for invalid
- [x] invite() creates token (OWNER only)
- [x] invite() rejects for non-OWNER
- [x] invite() rejects duplicate email
- [x] acceptInvite() creates user and session
- [x] acceptInvite() rejects expired token
- [x] acceptInvite() rejects used token
- [x] requestPasswordReset() creates token
- [x] requestPasswordReset() returns null for invalid email (security)
- [x] resetPassword() updates password
- [x] resetPassword() invalidates all sessions
- [x] resetPassword() rejects weak password
- [x] All operations emit correct events

**Completed**: November 9, 2025 - Commits 8e67fbc (initial implementation), bbcb60d (fixes)

### Commit Message

```
feat(auth): implement complete AuthService with 8 operations

- Add bootstrap() for first-time setup
- Add login() with credential validation
- Add logout() with event emission
- Add validateSession() with auto-cleanup
- Add invite() with OWNER role check
- Add acceptInvite() with token validation
- Add requestPasswordReset() with silent failure
- Add resetPassword() with session invalidation
- All methods emit audit events
- Add comprehensive test suite (30+ tests)

Related to Phase 0: Authentication
Depends on: PasswordService, SessionService
```

---

## Task 0.4: Auth Routes Implementation

**Estimated Time**: 4-6 hours  
**Actual Time**: ~6 hours  
**Status**: ✅ COMPLETE (November 9, 2025)  
**Depends On**: Task 0.3 ✅

### Goal

Implement 6 HTTP endpoints for authentication with proper validation, error handling, and cookie management.

### Subtasks Completed

- ✅ **Task 0.4.1**: Auth Middleware (Commit bbcb60d) - requireAuth, requireOwner
- ✅ **Task 0.4.2**: Bootstrap Endpoint (Commit dfe94a7) - POST /api/auth/bootstrap
- ✅ **Task 0.4.3**: Login/Logout Endpoints (Commit 22a685a) - POST /api/auth/login, /logout
- ✅ **Task 0.4.4**: Invite Endpoints (Commit 4b6ecf0) - POST /api/auth/invite, /invite/accept
- ✅ **Task 0.4.5**: Password Reset Endpoints (Commit 0d955c3) - POST /api/auth/password/reset/request, /reset

### Context

Routes exist but are stubs. Need to wire them to AuthService and implement proper request/response handling with Zod validation.

### Files to Modify

- `backend/routes/auth/api_auth_login.ts`
- `backend/routes/auth/api_auth_logout.ts`
- `backend/routes/auth/api_auth_bootstrap.ts`
- `backend/routes/auth/api_auth_invite.ts`
- `backend/routes/auth/api_auth_invite_accept.ts`
- `backend/routes/auth/api_auth_password_reset_request.ts`
- `backend/routes/auth/api_auth_password_reset.ts`
- `backend/middleware/auth.ts`

### Files to Create

- `backend/__tests__/routes/auth/*.test.ts` (7 test files)

### Implementation Examples

#### backend/routes/auth/api_auth_login.ts

```typescript
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { setCookie } from "hono/cookie";
import type { Context } from "hono";
import type { AuthService } from "../../services/authService.ts";

const LoginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password required"),
});

export function apiAuthLogin(authService: AuthService) {
  return [
    zValidator("json", LoginSchema),
    async (c: Context) => {
      try {
        const { email, password } = c.req.valid("json");

        const { user, session } = await authService.login(email, password);

        // Set session cookie
        setCookie(c, "session_id", session.id, {
          httpOnly: true,
          secure: true, // Requires HTTPS
          sameSite: "Strict",
          maxAge: 24 * 60 * 60, // 24 hours
          path: "/",
        });

        // Return user (exclude passwordHash)
        return c.json({
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt,
          },
        });
      } catch (error) {
        if (error instanceof Error && error.message === "Invalid credentials") {
          return c.json({ error: "Invalid credentials" }, 401);
        }
        console.error("Login error:", error);
        return c.json({ error: "Internal server error" }, 500);
      }
    },
  ];
}
```

#### backend/middleware/auth.ts

```typescript
import { getCookie } from "hono/cookie";
import type { Context, Next } from "hono";
import type { AuthService } from "../services/authService.ts";

/**
 * Middleware to require authentication
 * Validates session cookie and attaches user to context
 */
export function requireAuth(authService: AuthService) {
  return async (c: Context, next: Next) => {
    const sessionId = getCookie(c, "session_id");

    if (!sessionId) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const result = await authService.validateSession(sessionId);

    if (!result) {
      return c.json({ error: "Invalid or expired session" }, 401);
    }

    // Attach user and session to context
    c.set("user", result.user);
    c.set("session", result.session);

    await next();
  };
}

/**
 * Middleware to require OWNER role
 */
export function requireOwner(authService: AuthService) {
  return async (c: Context, next: Next) => {
    // First check authentication
    const authMiddleware = requireAuth(authService);
    await authMiddleware(c, async () => {
      const user = c.get("user");

      if (user.role !== "OWNER") {
        return c.json({ error: "OWNER role required" }, 403);
      }

      await next();
    });
  };
}
```

### Route Implementations

Implement remaining routes following the same pattern:

1. **api_auth_bootstrap.ts** - POST /api/auth/bootstrap
2. **api_auth_logout.ts** - POST /api/auth/logout (with requireAuth)
3. **api_auth_invite.ts** - POST /api/auth/invite (with requireOwner)
4. **api_auth_invite_accept.ts** - POST /api/auth/invite/accept
5. **api_auth_password_reset_request.ts** - POST /api/auth/password/reset/request
6. **api_auth_password_reset.ts** - POST /api/auth/password/reset

### Testing

Create integration tests for each route:

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../../../server.ts";
import { clearAllData } from "../../../db/helpers/clearData.ts";

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await clearAllData();
    // Bootstrap user for testing
    await app.request("/api/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Admin",
        email: "admin@example.com",
        password: "SecurePass123!",
      }),
    });
  });

  it("should login with valid credentials", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "SecurePass123!",
      }),
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data.user.email).toBe("admin@example.com");

    // Check cookie set
    const cookies = res.headers.get("set-cookie");
    expect(cookies).toContain("session_id");
    expect(cookies).toContain("HttpOnly");
    expect(cookies).toContain("Secure");
  });

  it("should reject invalid credentials", async () => {
    const res = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "WrongPassword!",
      }),
    });

    expect(res.status).toBe(401);
  });
});
```

### Validation

- [x] All 35+ route tests passing
- [x] Login returns user and sets cookie
- [x] Logout clears cookie
- [x] Bootstrap creates admin
- [x] Bootstrap rejects if users exist
- [x] Invite requires OWNER role
- [x] Accept invite creates user
- [x] Password reset flow works end-to-end
- [x] Protected routes require authentication
- [x] Middleware attaches user to context
- [x] All error cases handled properly

**Completed**: November 9, 2025 - Multiple commits (bbcb60d, dfe94a7, 22a685a, 4b6ecf0, 0d955c3)

### Commit Message

```
feat(auth): implement all 6 auth routes and middleware

- Add POST /api/auth/bootstrap endpoint
- Add POST /api/auth/login with cookie management
- Add POST /api/auth/logout
- Add POST /api/auth/invite (OWNER only)
- Add POST /api/auth/invite/accept
- Add POST /api/auth/password/reset/request
- Add POST /api/auth/password/reset
- Implement requireAuth middleware
- Implement requireOwner middleware
- Add Zod validation for all routes
- Add comprehensive integration tests (20+ tests)

Related to Phase 0: Authentication
Completes Phase 0
```

---

## Phase 0 Completion Checklist

### Implementation

- [x] Task 0.1: PasswordService (3-4 hrs) - Commit 98a5b60
- [x] Task 0.2: SessionService (2-3 hrs) - Commits 08a6d7f, a55c247
- [x] Task 0.3: AuthService (12-16 hrs) - Commits 8e67fbc, bbcb60d
- [x] Task 0.4: Auth Routes (4-6 hrs) - Commits bbcb60d, dfe94a7, 22a685a, 4b6ecf0, 0d955c3
- [x] Task 0.5: Documentation - Commit 2c7acf4

### Testing

- [x] 62+ total tests passing
- [x] Can bootstrap system
- [x] Can login/logout
- [x] Can invite users (OWNER only)
- [x] Can accept invitations
- [x] Can request password reset
- [x] Can reset password
- [x] Sessions work correctly
- [x] Middleware protects routes
- [x] All events emitted

### Documentation

- [x] Update architecture docs with auth flow
- [x] Document cookie configuration
- [x] Document token expiration policies
- [x] Create COMPLETION-SUMMARY.md
- [x] Update spec.md with completion status

---

## Phase 0 Complete! 🎉

**Total Time**: ~18 hours (vs 21-29 estimated)  
**Total Tests**: 62+ comprehensive tests  
**Total Commits**: 9 commits with detailed messages  
**Status**: ✅ Production-ready authentication infrastructure

See **COMPLETION-SUMMARY.md** for full details.

---

## Next Steps

After Phase 0 completion:

1. Merge to main branch
2. Start Phase 1: Events & SSE
3. All future phases can now use authentication

---

_Last Updated: November 8, 2025_  
_Ready to implement_
