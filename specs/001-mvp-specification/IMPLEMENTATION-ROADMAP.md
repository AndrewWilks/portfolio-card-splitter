# MVP Implementation Roadmap

**Status**: 60-70% Complete | **Timeline**: 4-5 weeks (58-80 hours)

---

## Quick Reference

### What Works ✅

- Database schema (19 tables)
- Entity layer (all entities with Zod)
- Repository layer (all CRUD operations)
- Core services (CardAccount, Card, Transaction, Pot, Member - basic CRUD)
- TypeScript compiles (0 errors)
- 176 tests passing

### Critical Blockers ❌

1. **AuthService** - All methods stub
2. **PasswordService** - All methods stub
3. **SessionService** - All methods stub
4. **SSE Stream** - Returns 501
5. **Event Emission** - No services emit events

---

## Phase 0: Authentication 🔴 BLOCKER

**Time**: 21-29 hours | **Must complete first**

### Tasks

#### 1. PasswordService (3-4 hrs)

```typescript
// backend/services/passwordService.ts
import * as bcrypt from "bcrypt";

async hash(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

async verify(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

validateStrength(password: string): boolean {
  // Min 8 chars, uppercase, lowercase, number, special
  return password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password);
}
```

#### 2. SessionService (2-3 hrs)

```typescript
// backend/services/sessionService.ts
export class SessionService {
  constructor(private readonly sessionRepo: SessionRepository) {}

  async create(userId: string, expirationHours = 24): Promise<Session> {
    return await this.sessionRepo.save(
      new Session({
        id: crypto.randomUUID(),
        userId,
        expiresAt: new Date(Date.now() + expirationHours * 60 * 60 * 1000),
      })
    );
  }

  isValid(session: Session): boolean {
    return session.expiresAt > new Date();
  }

  timeUntilExpiry(session: Session): number {
    return Math.max(0, session.expiresAt.getTime() - Date.now());
  }
}
```

#### 3. AuthService (12-16 hrs)

**bootstrap()** (2-3 hrs)

- Validate no users exist
- Hash password
- Create admin user
- Create session
- Emit event

**login()** (2-3 hrs)

- Find user by email
- Verify password
- Create session
- Emit event

**logout()** (1 hr)

- Delete session

**validateSession()** (1-2 hrs)

- Find session
- Check validity
- Load user
- Return { user, session } or null

**invite()** (2-3 hrs)

- Validate inviter role
- Check email not in use
- Generate token
- Create InviteToken
- Emit event

**acceptInvite()** (2-3 hrs)

- Find token
- Validate
- Hash password
- Create user
- Mark token used
- Create session
- Emit event

**requestPasswordReset()** (1-2 hrs)

- Find user
- Generate token
- Create PasswordResetToken

**resetPassword()** (1-2 hrs)

- Find token
- Validate
- Hash password
- Update user
- Mark token used

#### 4. Auth Routes (4-6 hrs)

**api_auth_login.ts** (1 hr)

```typescript
const LoginSchema = object({
  email: string().email(),
  password: string(),
});

export function apiAuthLogin(c: Context, authService: AuthService) {
  const data = c.req.valid("json");
  const { user, session } = await authService.login(data.email, data.password);

  setCookie(c, "session_id", session.id, {
    httpOnly: true,
    secure: true,
    sameSite: "Strict",
    maxAge: 24 * 60 * 60,
  });

  return c.json({ user: { ...user, passwordHash: undefined } });
}
```

Implement remaining 5 routes: logout, invite, acceptInvite, requestReset, resetPassword

---

## Phase 1: Events & SSE 🔴 CRITICAL

**Time**: 14-20 hours | **Needed for MVP**

### Task 1.1: Event Emission (8-12 hrs)

**Update DI** (1 hr): Inject EventRepository into all services

**Pattern**:

```typescript
async createTransaction(data, actorId: string) {
  const transaction = await this.transactionRepo.save(newTransaction);

  await this.eventRepo.save(new Event({
    entityType: "transaction",
    entityId: transaction.id,
    eventType: "created",
    actorId,
    metadata: { amount: transaction.amountCents, merchant: transaction.merchant },
  }));

  return transaction;
}
```

**Services to update**:

- TransactionService (2 hrs)
- PaymentService (1 hr)
- ReservationService (1 hr)
- TransferService (1 hr)
- PotService (1 hr)
- MemberService (1 hr)
- CardAccountService (1 hr)
- AuthService (already done in Phase 0)

### Task 1.2: SSE Stream (6-8 hrs)

```typescript
// backend/routes/events/api_events_stream.ts
export function apiEventsStream(c: Context, eventRepository: EventRepository) {
  return c.streamText(async (stream) => {
    let lastTimestamp = new Date();

    const interval = setInterval(async () => {
      const events = await eventRepository.list({ since: lastTimestamp });

      for (const event of events) {
        await stream.writeln(`data: ${JSON.stringify(event)}\n\n`);
        lastTimestamp = event.createdAt;
      }
    }, 2000);

    stream.onAbort(() => clearInterval(interval));
  });
}
```

---

## Phase 2: Validation 🟡 HIGH

**Time**: 19-25 hours | **Should do before launch**

### TransactionService (3-4 hrs)

- Fix Date serialization
- Validate allocations sum to 100% or transaction amount
- Validate cannot mix percentage/fixed
- Validate members exist
- Fix createdById from auth context
- Implement tag saving

### ReservationService (5-6 hrs)

- Validate member exists
- Validate allocation exists
- Validate allocation → transaction
- Validate allocation → member
- Validate reservation ≤ allocation
- Validate total reservations ≤ transaction
- Validate pot has balance

### PaymentService (3-4 hrs)

- Validate payment ≤ transaction
- Implement reconciliation flag logic

### PotService (4-5 hrs)

- Implement SOLO pot access control
- Implement SHARED pot ACL
- Implement enrichPots()

### LedgerService (3-4 hrs)

- Implement getBalances()
- Implement calculateSettlement()

---

## Phase 3: Polish 🟢 LOW

**Time**: 4-6 hours | **Can launch without**

### AuditService (2-3 hrs)

- Inject EventRepository
- Implement getAuditTrail()
- Uncomment route

### Minor TODOs (2-3 hrs)

- MemberService archive validation
- MerchantService filtering
- Test fixes

---

## Milestones

### Week 1-2: Authentication

- [ ] PasswordService complete
- [ ] SessionService complete
- [ ] AuthService complete
- [ ] All auth routes working
- [ ] Can bootstrap, login, logout
- [ ] Can invite users
- [ ] Can reset password

**Deliverable**: Users can authenticate

---

### Week 3: Events & Real-time

- [ ] All services emit events
- [ ] SSE stream working
- [ ] Frontend receives live updates
- [ ] Audit trail populated

**Deliverable**: Real-time collaborative app

---

### Week 4-5: Business Logic

- [ ] All validation checks implemented
- [ ] ACL enforcement working
- [ ] Reconciliation logic complete
- [ ] All 210 tests passing

**Deliverable**: Production-ready MVP

---

## Testing Strategy

### Phase 0 Tests

- PasswordService: hash, verify, strength validation
- SessionService: create, isValid, expiry
- AuthService: all 8 methods
- Auth routes: integration tests

### Phase 1 Tests

- Verify events saved after operations
- Test SSE connection and delivery
- Test event filtering

### Phase 2 Tests

- All validation scenarios
- ACL permission checks
- Balance calculations

---

## Success Criteria

### Minimum Viable (After Phase 0 + 1)

- ✅ Users can bootstrap system
- ✅ Users can login/logout
- ✅ Users can invite others
- ✅ Password reset works
- ✅ Real-time updates via SSE
- ✅ Audit trail exists

### Complete MVP (After All Phases)

- ✅ All minimum viable features
- ✅ Business rule validation
- ✅ ACL enforcement
- ✅ Payment reconciliation
- ✅ Balance calculations
- ✅ All tests passing

---

## Time Tracking

| Phase     | Tasks           | Estimated     | Status         |
| --------- | --------------- | ------------- | -------------- |
| Phase 0   | Auth Foundation | 21-29 hrs     | ⏳ Not started |
| Phase 1   | Events & SSE    | 14-20 hrs     | ⏳ Not started |
| Phase 2   | Validation      | 19-25 hrs     | ⏳ Not started |
| Phase 3   | Polish          | 4-6 hrs       | ⏳ Not started |
| **Total** |                 | **58-80 hrs** |                |

---

## Daily Progress Log

### Week 1

- [ ] Day 1: PasswordService
- [ ] Day 2: SessionService
- [ ] Day 3-4: AuthService (bootstrap, login, logout, validate)
- [ ] Day 5: AuthService (invite, accept, reset)

### Week 2

- [ ] Day 6-7: Auth routes
- [ ] Day 8: Auth testing & fixes
- [ ] Day 9: Event emission setup
- [ ] Day 10: Event emission in services

### Week 3

- [ ] Day 11-12: SSE implementation
- [ ] Day 13: SSE testing
- [ ] Day 14-15: TransactionService validation

### Week 4

- [ ] Day 16-17: ReservationService validation
- [ ] Day 18-19: PaymentService reconciliation
- [ ] Day 20: PotService ACL

### Week 5

- [ ] Day 21: LedgerService
- [ ] Day 22: AuditService
- [ ] Day 23: Minor TODOs
- [ ] Day 24-25: Final testing & polish

---

_Last Updated: November 8, 2025_  
_Current Status: 60-70% Complete_  
_Next Task: Start Phase 0 - PasswordService Implementation_
