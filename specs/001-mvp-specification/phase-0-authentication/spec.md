# Phase 0: Authentication - Specification

**Date**: November 8, 2025  
**Completion Date**: November 9, 2025  
**Status**: ✅ COMPLETE  
**Estimated Time**: 21-29 hours  
**Actual Time**: ~18 hours  
**Priority**: CRITICAL

---

## Summary

Authentication infrastructure is **100% complete** with all services, middleware, and routes fully implemented and tested.

- ✅ Can bootstrap the application
- ✅ Can login and logout
- ✅ Can invite users
- ✅ Can reset passwords
- ✅ Complete session management
- ✅ Middleware protection for routes

**All authentication services, middleware, and routes are fully implemented with comprehensive test coverage (62+ tests). See COMPLETION-SUMMARY.md for details.**

---

## Context

### Current State

**AuthService** (`backend/services/authService.ts`):

- 8 methods: bootstrap, login, logout, validateSession, invite, acceptInvite, requestPasswordReset, resetPassword
- All throw `"Not implemented"`

**PasswordService** (`backend/services/passwordService.ts`):

- 3 methods: hash, verify, validateStrength
- All throw errors
- Note: `shared/services/passwordService.ts` HAS working implementation but is unused by backend

**SessionService** (`backend/services/sessionService.ts`):

- 3 static methods: create, isValid, timeUntilExpiry
- All throw errors
- Not integrated with SessionRepository

**Auth Middleware** (`backend/middleware/auth.ts`):

- Exists but calls stub validateSession
- Cannot protect routes

**Auth Routes**:

- All 6 routes exist but call stub services
- Return 500 errors on invocation

### Dependencies Already Complete ✅

- ✅ User entity and repository
- ✅ Session entity and repository
- ✅ InviteToken entity and repository
- ✅ PasswordResetToken entity and repository
- ✅ Database tables and migrations
- ✅ Zod validation schemas

---

## Requirements

### Functional Requirements

#### FR-1: Password Security

- Passwords MUST be hashed using bcrypt with salt rounds ≥ 10
- Password strength validation MUST enforce:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character

#### FR-2: Session Management

- Sessions MUST have configurable expiration (default 24 hours)
- Sessions MUST be validated on every protected route
- Session cookie MUST be httpOnly, secure, and sameSite: 'Strict'
- Logout MUST delete session from database and clear cookie

#### FR-3: Bootstrap (First-Time Setup)

- System MUST verify no users exist before allowing bootstrap
- MUST create admin user with OWNER role
- MUST create initial session
- MUST emit "user.created" event
- Bootstrap endpoint MUST be disabled after first user created

#### FR-4: Login

- MUST validate email/password combination
- MUST return session cookie on success
- MUST emit "user.login" event
- MUST return user object (excluding passwordHash)
- Failed login MUST return 401

#### FR-5: User Invitation

- Only OWNER role can invite users
- MUST validate email is not already in use
- MUST generate secure random token
- MUST create InviteToken with 7-day expiration
- MUST emit "user.invited" event
- Token MUST be returned for email delivery (not auto-sent)

#### FR-6: Accept Invitation

- MUST validate token exists and not expired
- MUST validate token not already used
- MUST validate password strength
- MUST create user with MEMBER role
- MUST mark token as used
- MUST create session
- MUST emit "user.created" event

#### FR-7: Password Reset Request

- MUST validate user exists by email
- MUST generate secure random token
- MUST create PasswordResetToken with 1-hour expiration
- Token MUST be returned for email delivery (not auto-sent)
- Returns success even if email doesn't exist (security)

#### FR-8: Password Reset

- MUST validate token exists and not expired
- MUST validate token not already used
- MUST validate password strength
- MUST hash new password
- MUST mark token as used
- MUST invalidate all existing sessions for that user
- MUST emit "user.password_reset" event

### Non-Functional Requirements

#### NFR-1: Security

- No passwords stored in plain text
- Tokens must be cryptographically secure (crypto.randomUUID())
- Rate limiting recommended (not implemented in Phase 0)
- HTTPS required in production

#### NFR-2: Performance

- Session validation MUST complete in <50ms
- bcrypt hashing MUST use 10 rounds (balance security/speed)

#### NFR-3: Auditability

- All auth operations MUST emit events for audit trail
- Events MUST include actorId where applicable

#### NFR-4: Error Handling

- MUST NOT leak information about user existence
- MUST return generic error messages to client
- MUST log detailed errors server-side

---

## Business Rules

### BR-1: User Roles

- System supports two roles: OWNER, MEMBER
- First user (bootstrap) MUST be OWNER
- Only OWNER can invite users
- Invited users are MEMBER by default

### BR-2: Token Expiration

- InviteToken: 7 days
- PasswordResetToken: 1 hour
- Session: 24 hours (configurable)

### BR-3: Token Single-Use

- All tokens can only be used once
- Attempting to reuse token returns 401/403

### BR-4: Email Uniqueness

- Email addresses MUST be unique (case-insensitive)
- Attempting to invite existing email returns 409

### BR-5: Session Lifecycle

- Sessions created on: bootstrap, login, acceptInvite
- Sessions destroyed on: logout, password reset (all sessions)
- Expired sessions automatically invalid (checked on validate)

---

## API Endpoints

### POST /api/auth/bootstrap

**Purpose**: First-time system setup

**Request**:

```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "SecurePass123!"
}
```

**Response** (201):

```json
{
  "user": {
    "id": "uuid",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "OWNER",
    "createdAt": "2025-11-08T10:00:00Z"
  }
}
```

**Errors**:

- 409: Users already exist
- 400: Invalid password strength

---

### POST /api/auth/login

**Purpose**: User authentication

**Request**:

```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response** (200):

```json
{
  "user": {
    "id": "uuid",
    "name": "User Name",
    "email": "user@example.com",
    "role": "MEMBER",
    "createdAt": "2025-11-08T10:00:00Z"
  }
}
```

**Cookie Set**: `session_id` (httpOnly, secure, sameSite: Strict, maxAge: 24h)

**Errors**:

- 401: Invalid credentials
- 400: Validation error

---

### POST /api/auth/logout

**Purpose**: End user session

**Request**: None (uses session cookie)

**Response** (204): No content

**Cookie**: Cleared

---

### POST /api/auth/invite

**Purpose**: Invite new user

**Auth**: Required (OWNER only)

**Request**:

```json
{
  "email": "newuser@example.com"
}
```

**Response** (201):

```json
{
  "token": "uuid-token",
  "expiresAt": "2025-11-15T10:00:00Z"
}
```

**Errors**:

- 401: Not authenticated
- 403: Not OWNER role
- 409: Email already in use

---

### POST /api/auth/invite/accept

**Purpose**: Accept invitation and create account

**Request**:

```json
{
  "token": "uuid-token",
  "name": "New User",
  "password": "SecurePass123!"
}
```

**Response** (201):

```json
{
  "user": {
    "id": "uuid",
    "name": "New User",
    "email": "newuser@example.com",
    "role": "MEMBER",
    "createdAt": "2025-11-08T10:00:00Z"
  }
}
```

**Cookie Set**: `session_id`

**Errors**:

- 401: Invalid/expired token
- 400: Invalid password strength

---

### POST /api/auth/password/reset/request

**Purpose**: Request password reset

**Request**:

```json
{
  "email": "user@example.com"
}
```

**Response** (200):

```json
{
  "token": "uuid-token"
}
```

**Note**: Returns success even if email doesn't exist (security)

---

### POST /api/auth/password/reset

**Purpose**: Reset password with token

**Request**:

```json
{
  "token": "uuid-token",
  "password": "NewSecurePass123!"
}
```

**Response** (200):

```json
{
  "success": true
}
```

**Side Effects**: All sessions for user invalidated

**Errors**:

- 401: Invalid/expired token
- 400: Invalid password strength

---

## Events Emitted

All events are saved to `events` table via EventRepository.

### user.created

```typescript
{
  entityType: "user",
  entityId: userId,
  eventType: "created",
  actorId: actorId, // or null for bootstrap
  metadata: { email, role }
}
```

### user.login

```typescript
{
  entityType: "user",
  entityId: userId,
  eventType: "login",
  actorId: userId,
  metadata: { email }
}
```

### user.logout

```typescript
{
  entityType: "user",
  entityId: userId,
  eventType: "logout",
  actorId: userId,
  metadata: { sessionId }
}
```

### user.invited

```typescript
{
  entityType: "user",
  entityId: tokenId,
  eventType: "invited",
  actorId: inviterId,
  metadata: { email, expiresAt }
}
```

### user.password_reset

```typescript
{
  entityType: "user",
  entityId: userId,
  eventType: "password_reset",
  actorId: userId,
  metadata: {}
}
```

---

## Testing Requirements

### Unit Tests

**PasswordService** (`backend/__tests__/services/passwordService.test.ts`):

- ✅ hash() creates valid bcrypt hash
- ✅ verify() correctly validates password
- ✅ verify() rejects wrong password
- ✅ validateStrength() enforces all rules

**SessionService** (`backend/__tests__/services/sessionService.test.ts`):

- ✅ create() generates valid session
- ✅ create() respects expiration hours
- ✅ isValid() returns true for non-expired
- ✅ isValid() returns false for expired
- ✅ timeUntilExpiry() calculates correctly

**AuthService** (`backend/__tests__/services/authService.test.ts`):

- ✅ bootstrap() creates admin and session
- ✅ bootstrap() fails if users exist
- ✅ login() succeeds with valid credentials
- ✅ login() fails with invalid credentials
- ✅ logout() deletes session
- ✅ validateSession() returns user for valid session
- ✅ validateSession() returns null for invalid
- ✅ invite() creates token (OWNER only)
- ✅ invite() fails for non-OWNER
- ✅ acceptInvite() creates user and session
- ✅ acceptInvite() fails with expired token
- ✅ requestPasswordReset() creates token
- ✅ resetPassword() updates password and invalidates sessions

### Integration Tests

**Auth Routes** (`backend/__tests__/routes/auth/*.test.ts`):

- ✅ POST /api/auth/bootstrap full flow
- ✅ POST /api/auth/login full flow with cookie
- ✅ POST /api/auth/logout clears cookie
- ✅ POST /api/auth/invite full flow
- ✅ POST /api/auth/invite/accept full flow
- ✅ POST /api/auth/password/reset/request full flow
- ✅ POST /api/auth/password/reset full flow
- ✅ Protected routes reject unauthenticated requests
- ✅ Protected routes accept valid session
- ✅ Events emitted correctly for all operations

---

## Success Criteria

### Minimum Viable ✅

- [x] Can bootstrap system with first admin user
- [x] Can login with email/password
- [x] Can logout and session cleared
- [x] Session cookie properly secured
- [x] Auth middleware protects routes

### Complete ✅

- [x] All 8 AuthService methods implemented
- [x] All 3 PasswordService methods implemented
- [x] All SessionService methods implemented
- [x] All 6 auth routes working
- [x] All events emitted correctly
- [x] All unit tests passing (26 tests)
- [x] All integration tests passing (36 tests)
- [x] Can invite users (OWNER only)
- [x] Can accept invitations
- [x] Can request and complete password reset

**Phase 0 is 100% complete. See COMPLETION-SUMMARY.md for full details.**

---

## Out of Scope

The following are explicitly NOT included in Phase 0:

- ❌ Email sending (tokens returned via API)
- ❌ Rate limiting
- ❌ Multi-factor authentication
- ❌ OAuth/Social login
- ❌ Remember me functionality
- ❌ Account lockout after failed attempts
- ❌ Password history
- ❌ Session refresh tokens

---

## Dependencies

### Must Be Complete Before Starting

- ✅ User entity and repository
- ✅ Session entity and repository
- ✅ InviteToken entity and repository
- ✅ PasswordResetToken entity and repository
- ✅ EventRepository for audit trail

### Blocks These Features

- 🔴 All other phases (nothing works without auth)
- 🔴 Protected API endpoints
- 🔴 User-scoped data queries
- 🔴 Audit trail (requires actorId from session)

---

## Risk Assessment

### High Risk

- **Security vulnerabilities**: Improper session handling, weak password validation
  - _Mitigation_: Follow OWASP guidelines, use battle-tested bcrypt

### Medium Risk

- **Token expiration edge cases**: Race conditions with expired tokens
  - _Mitigation_: Comprehensive timestamp testing

### Low Risk

- **Performance**: bcrypt hashing is slow by design
  - _Mitigation_: 10 rounds is industry standard balance

---

## Notes

1. **Shared PasswordService**: A working implementation exists at `shared/services/passwordService.ts` that can be referenced or adapted for backend use.

2. **Event Emission**: This phase sets the pattern for event emission that all other phases will follow.

3. **Session Storage**: Currently database-backed. Consider Redis for production if performance is an issue.

4. **Token Delivery**: Tokens are returned via API. Email integration is a future enhancement.

5. **Bootstrap Security**: In production, consider requiring a secret key or disabling bootstrap endpoint after use.

---

_Last Updated: November 8, 2025_  
_Next: See implementation-plan.md for detailed task breakdown_
