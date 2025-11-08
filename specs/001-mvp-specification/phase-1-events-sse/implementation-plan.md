# Phase 1: Events & Real-Time Updates - Implementation Plan

**Date**: November 8, 2025  
**Status**: 🔴 Ready to Start  
**Estimated Time**: 14-20 hours  
**Depends On**: Phase 0 (Authentication)

---

## Overview

This plan implements event emission and real-time updates in 2 sequential tasks:

1. **Event Emission** (8-12 hrs) - Add event emission to all 7 core services
2. **SSE Stream** (6-8 hrs) - Implement Server-Sent Events endpoint with filtering

---

## Task 1.1: Event Emission Across Services

**Estimated Time**: 8-12 hours  
**Status**: ⏳ Not Started  
**Depends On**: Phase 0 complete

### Goal

Add event emission to all create/update/delete operations across 7 core services: Transaction, Payment, Reservation, Transfer, Pot, Member, CardAccount.

### Context

EventRepository is fully implemented but never used. Need to inject it into all services via DI and add event emission calls after successful operations.

### Pattern

Every service follows this pattern:

```typescript
async createEntity(data, actorId: string) {
  // 1. Perform the operation
  const entity = await this.entityRepo.save(newEntity);

  // 2. Emit event
  await this.eventRepo.save(new Event({
    id: crypto.randomUUID(),
    entityType: "entitytype",
    entityId: entity.id,
    eventType: "created",
    actorId,
    metadata: { /* relevant data */ },
    createdAt: new Date(),
  }));

  // 3. Return result
  return entity;
}
```

### Files to Modify

#### Dependency Injection

**backend/di/services.ts**:

- Add `eventRepository` parameter to all service constructors

```typescript
// Current
const transactionService = new TransactionService(
  transactionRepository,
  allocationRepository,
  tagRepository
);

// Updated
const transactionService = new TransactionService(
  transactionRepository,
  allocationRepository,
  tagRepository,
  eventRepository // ADD THIS
);
```

Repeat for all 7 services.

#### Service Constructors

Add EventRepository to constructor params:

```typescript
export class TransactionService {
  constructor(
    private readonly transactionRepo: TransactionRepository,
    private readonly allocationRepo: AllocationRepository,
    private readonly tagRepo: TagRepository,
    private readonly eventRepo: EventRepository // ADD THIS
  ) {}
}
```

#### Service Methods

### TransactionService (2 hours)

**backend/services/transactionService.ts**

Add to `createTransaction()`:

```typescript
async createTransaction(data: CreateTransactionData, actorId: string) {
  // ... existing validation and creation logic ...

  const transaction = await this.transactionRepo.save(newTransaction);

  // Emit event
  await this.eventRepo.save(new Event({
    id: crypto.randomUUID(),
    entityType: "transaction",
    entityId: transaction.id,
    eventType: "created",
    actorId,
    metadata: {
      amountCents: transaction.amountCents,
      merchant: transaction.merchant,
      type: transaction.type,
    },
    createdAt: new Date(),
  }));

  return transaction;
}
```

Add to `updateTransaction()`:

```typescript
async updateTransaction(id: string, data: UpdateTransactionData, actorId: string) {
  const existing = await this.transactionRepo.findById(id);
  if (!existing) throw new Error("Transaction not found");

  // Track changes for metadata
  const changes: Record<string, string> = {};
  if (data.amountCents !== undefined && data.amountCents !== existing.amountCents) {
    changes.amountCents = `${existing.amountCents} → ${data.amountCents}`;
  }
  if (data.description !== undefined && data.description !== existing.description) {
    changes.description = `${existing.description} → ${data.description}`;
  }

  const updated = await this.transactionRepo.save({ ...existing, ...data });

  // Emit event
  await this.eventRepo.save(new Event({
    id: crypto.randomUUID(),
    entityType: "transaction",
    entityId: id,
    eventType: "updated",
    actorId,
    metadata: { changes },
    createdAt: new Date(),
  }));

  return updated;
}
```

Add to `deleteTransaction()`:

```typescript
async deleteTransaction(id: string, actorId: string) {
  await this.transactionRepo.delete(id);

  await this.eventRepo.save(new Event({
    id: crypto.randomUUID(),
    entityType: "transaction",
    entityId: id,
    eventType: "deleted",
    actorId,
    metadata: {},
    createdAt: new Date(),
  }));
}
```

### PaymentService (1 hour)

**backend/services/paymentService.ts**

Add to `createPayment()`:

```typescript
async createPayment(data: CreatePaymentData, actorId: string) {
  // ... existing logic ...

  const payment = await this.paymentRepo.save(newPayment);

  await this.eventRepo.save(new Event({
    id: crypto.randomUUID(),
    entityType: "payment",
    entityId: payment.id,
    eventType: "created",
    actorId,
    metadata: {
      amountCents: payment.amountCents,
      potId: payment.potId,
      transactionId: payment.transactionId,
      reconciled: payment.reconciled,
    },
    createdAt: new Date(),
  }));

  return payment;
}
```

### ReservationService (1 hour)

**backend/services/reservationService.ts**

Add events to `createReservation()`, `updateReservation()`, `deleteReservation()`:

```typescript
// After successful operation
await this.eventRepo.save(
  new Event({
    id: crypto.randomUUID(),
    entityType: "reservation",
    entityId: reservation.id,
    eventType: "created", // or "updated", "deleted"
    actorId,
    metadata: {
      amountCents: reservation.amountCents,
      potId: reservation.potId,
      allocationId: reservation.allocationId,
    },
    createdAt: new Date(),
  })
);
```

### TransferService (1 hour)

**backend/services/transferService.ts**

Add to `createTransfer()`:

```typescript
await this.eventRepo.save(
  new Event({
    id: crypto.randomUUID(),
    entityType: "transfer",
    entityId: transfer.id,
    eventType: "created",
    actorId,
    metadata: {
      amountCents: transfer.amountCents,
      fromPotId: transfer.fromPotId,
      toPotId: transfer.toPotId,
      type: transfer.type,
    },
    createdAt: new Date(),
  })
);
```

### PotService (1 hour)

**backend/services/potService.ts**

Add to `createPot()` and `updatePot()`:

```typescript
await this.eventRepo.save(
  new Event({
    id: crypto.randomUUID(),
    entityType: "pot",
    entityId: pot.id,
    eventType: "created", // or "updated"
    actorId,
    metadata: {
      name: pot.name,
      type: pot.type,
      balanceCents: pot.balanceCents,
    },
    createdAt: new Date(),
  })
);
```

### MemberService (1 hour)

**backend/services/memberService.ts**

Add to `createMember()`, `updateMember()`, `archiveMember()`:

```typescript
await this.eventRepo.save(
  new Event({
    id: crypto.randomUUID(),
    entityType: "member",
    entityId: member.id,
    eventType: "created", // or "updated", "archived"
    actorId,
    metadata: {
      name: member.name,
      role: member.role,
      isArchived: member.isArchived,
    },
    createdAt: new Date(),
  })
);
```

### CardAccountService (1 hour)

**backend/services/cardAccountService.ts**

Add to `createCardAccount()` and `updateCardAccount()`:

```typescript
await this.eventRepo.save(
  new Event({
    id: crypto.randomUUID(),
    entityType: "cardaccount",
    entityId: cardAccount.id,
    eventType: "created", // or "updated"
    actorId,
    metadata: {
      name: cardAccount.name,
      issuer: cardAccount.issuer,
      last4: cardAccount.last4,
    },
    createdAt: new Date(),
  })
);
```

### Route Updates

All routes that call service methods need to pass `actorId`:

```typescript
// Get actorId from authenticated user
const user = c.get("user"); // From auth middleware
const actorId = user.id;

// Pass to service
const transaction = await transactionService.createTransaction(data, actorId);
```

Update routes:

- `backend/routes/transactions/api_transactions_create.ts`
- `backend/routes/transactions/api_transactions_update.ts`
- `backend/routes/transactions/api_transactions_delete.ts`
- `backend/routes/payments/api_payments_create.ts`
- `backend/routes/reservations/api_reservations_create.ts`
- `backend/routes/reservations/api_reservations_update.ts`
- `backend/routes/reservations/api_reservations_delete.ts`
- `backend/routes/transfers/api_transfers_create.ts`
- `backend/routes/pots/api_pots_create.ts`
- `backend/routes/pots/api_pots_update.ts`
- `backend/routes/members/api_members_create.ts`
- `backend/routes/members/api_members_update.ts`
- `backend/routes/members/api_members_archive.ts`

### Testing

Update existing service tests to verify events emitted:

```typescript
describe("TransactionService.createTransaction", () => {
  it("should emit event after creation", async () => {
    const actorId = "test-user-id";
    const transaction = await transactionService.createTransaction(
      data,
      actorId
    );

    // Verify event saved
    const events = await eventRepository.findByEntityId(transaction.id);
    expect(events).toHaveLength(1);

    const event = events[0];
    expect(event.entityType).toBe("transaction");
    expect(event.entityId).toBe(transaction.id);
    expect(event.eventType).toBe("created");
    expect(event.actorId).toBe(actorId);
    expect(event.metadata.amountCents).toBe(transaction.amountCents);
  });
});
```

Add similar tests to all service test files (21+ new tests).

### Validation

- [ ] All 7 services updated
- [ ] All create/update/delete operations emit events
- [ ] Events include correct metadata
- [ ] Events have actorId
- [ ] Routes pass actorId from authenticated user
- [ ] All 21+ event emission tests passing
- [ ] Existing tests still pass (no regressions)

### Commit Messages

Commit each service separately:

```
feat(events): add event emission to TransactionService

- Emit events on create, update, delete
- Include amountCents, merchant, type in metadata
- Pass actorId from routes
- Add 3 new tests for event emission

Related to Phase 1: Events & SSE
```

Repeat pattern for each service.

---

## Task 1.2: SSE Stream Implementation

**Estimated Time**: 6-8 hours  
**Status**: ⏳ Not Started  
**Depends On**: Task 1.1

### Goal

Implement Server-Sent Events endpoint that streams events in real-time with authentication, filtering, and ACL enforcement.

### Context

Route exists but returns 501. Need to implement streaming logic with proper SSE format, polling, and security.

### Files to Modify

- `backend/routes/events/api_events_stream.ts`
- `backend/routes/events/index.ts` (wire up route)
- `backend/di/routes.ts` (ensure route registered)

### Files to Create

- `backend/__tests__/routes/events/api_events_stream.test.ts`

### Implementation

#### backend/routes/events/api_events_stream.ts

```typescript
import { Context } from "hono";
import { z } from "zod";
import type { EventRepository } from "../../repositories/eventRepository.ts";
import type { PotRepository } from "../../repositories/potRepository.ts";

const QuerySchema = z.object({
  since: z.string().datetime().optional(),
});

/**
 * SSE endpoint for real-time event streaming
 * Requires authentication
 * Filters events based on user's pot access (ACL)
 */
export function apiEventsStream(
  eventRepository: EventRepository,
  potRepository: PotRepository
) {
  return async (c: Context) => {
    // Get authenticated user
    const user = c.get("user");
    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    // Parse query params
    const query = c.req.query();
    const validation = QuerySchema.safeParse(query);

    let sinceTimestamp: Date | undefined;
    if (validation.success && validation.data.since) {
      sinceTimestamp = new Date(validation.data.since);
    }

    // Get user's accessible pot IDs (for ACL filtering)
    const userPots = await potRepository.findByUserId(user.id);
    const accessiblePotIds = new Set(userPots.map((p) => p.id));

    return c.streamText(async (stream) => {
      let lastTimestamp = sinceTimestamp || new Date();
      let isRunning = true;

      // Polling interval
      const interval = setInterval(async () => {
        if (!isRunning) return;

        try {
          // Fetch new events since last poll
          const events = await eventRepository.list({
            since: lastTimestamp,
            limit: 100,
          });

          // Filter events based on ACL
          const filteredEvents = events.filter((event) => {
            // User events visible to all authenticated users
            if (event.entityType === "user") return true;

            // Pot-related events: check access
            if (event.entityType === "pot") {
              return accessiblePotIds.has(event.entityId);
            }

            // Transaction/Payment/Reservation: check pot access via metadata
            if (
              event.entityType === "transaction" ||
              event.entityType === "payment" ||
              event.entityType === "reservation"
            ) {
              const potId = event.metadata.potId;
              return potId ? accessiblePotIds.has(potId) : true;
            }

            // Member events: visible to pot members
            if (event.entityType === "member") {
              // Check if user has access to any pot with this member
              const memberPotId = event.metadata.potId;
              return memberPotId ? accessiblePotIds.has(memberPotId) : true;
            }

            // Default: visible
            return true;
          });

          // Stream events
          for (const event of filteredEvents) {
            await stream.writeln(`data: ${JSON.stringify(event)}\n`);

            // Update last timestamp
            if (event.createdAt > lastTimestamp) {
              lastTimestamp = event.createdAt;
            }
          }
        } catch (error) {
          console.error("SSE polling error:", error);
        }
      }, 2000); // Poll every 2 seconds

      // Cleanup on disconnect
      stream.onAbort(() => {
        isRunning = false;
        clearInterval(interval);
        console.log(`SSE connection closed for user ${user.id}`);
      });

      // Set SSE headers
      c.header("Content-Type", "text/event-stream");
      c.header("Cache-Control", "no-cache");
      c.header("Connection", "keep-alive");
      c.header("X-Accel-Buffering", "no"); // Disable nginx buffering

      // Send initial heartbeat
      await stream.writeln(`: Connected\n`);
    });
  };
}
```

#### Wire up route

**backend/routes/events/index.ts**:

```typescript
import { Hono } from "hono";
import { apiEventsStream } from "./api_events_stream.ts";
import { requireAuth } from "../../middleware/auth.ts";
import type { EventRepository } from "../../repositories/eventRepository.ts";
import type { PotRepository } from "../../repositories/potRepository.ts";
import type { AuthService } from "../../services/authService.ts";

export function eventsRoutes(
  eventRepository: EventRepository,
  potRepository: PotRepository,
  authService: AuthService
) {
  const router = new Hono();

  // SSE stream - requires authentication
  router.get(
    "/stream",
    requireAuth(authService),
    apiEventsStream(eventRepository, potRepository)
  );

  return router;
}
```

### Testing

#### backend/**tests**/routes/events/api_events_stream.test.ts

```typescript
import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../../../server.ts";
import { clearAllData } from "../../../db/helpers/clearData.ts";
import { EventRepository } from "../../../repositories/eventRepository.ts";
import { Event } from "../../../../shared/entities/event.ts";
import { getDbClient } from "../../../db/db.client.ts";

describe("GET /api/events/stream", () => {
  let eventRepository: EventRepository;
  let authCookie: string;

  beforeEach(async () => {
    const db = await getDbClient();
    await clearAllData(db);
    eventRepository = new EventRepository(db);

    // Bootstrap and login to get auth cookie
    await app.request("/api/auth/bootstrap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Admin",
        email: "admin@example.com",
        password: "SecurePass123!",
      }),
    });

    const loginRes = await app.request("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        password: "SecurePass123!",
      }),
    });

    authCookie = loginRes.headers.get("set-cookie")!;
  });

  it("should require authentication", async () => {
    const res = await app.request("/api/events/stream");
    expect(res.status).toBe(401);
  });

  it("should stream events in SSE format", async () => {
    // Create test event
    await eventRepository.save(
      new Event({
        id: crypto.randomUUID(),
        entityType: "transaction",
        entityId: "test-id",
        eventType: "created",
        actorId: "test-user",
        metadata: { test: true },
        createdAt: new Date(),
      })
    );

    const res = await app.request("/api/events/stream", {
      headers: { Cookie: authCookie },
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toBe("text/event-stream");
    expect(res.headers.get("cache-control")).toBe("no-cache");
  });

  it("should respect since parameter", async () => {
    const now = new Date();
    const past = new Date(now.getTime() - 10000);

    // Create old event
    await eventRepository.save(
      new Event({
        id: crypto.randomUUID(),
        entityType: "transaction",
        entityId: "old-id",
        eventType: "created",
        actorId: "test-user",
        metadata: {},
        createdAt: past,
      })
    );

    // Stream should not include old event
    const res = await app.request(
      `/api/events/stream?since=${now.toISOString()}`,
      {
        headers: { Cookie: authCookie },
      }
    );

    expect(res.status).toBe(200);
    // Verify old event not in stream (implementation-specific test)
  });

  // Note: Testing actual streaming behavior requires special SSE client testing
  // These tests verify setup and basic functionality
});
```

### Validation

- [ ] SSE endpoint requires authentication
- [ ] Returns correct SSE headers
- [ ] Streams events in proper format
- [ ] Respects `since` parameter
- [ ] ACL filtering works (users only see accessible events)
- [ ] Handles client disconnection
- [ ] Can support multiple concurrent connections
- [ ] All 5+ SSE tests passing

### Commit Message

```
feat(events): implement SSE streaming endpoint

- Add GET /api/events/stream with SSE support
- Poll for new events every 2 seconds
- Filter events by user's pot access (ACL)
- Support timestamp-based reconnection with `since` param
- Handle client disconnection gracefully
- Add authentication requirement
- Add integration tests

Related to Phase 1: Events & SSE
Completes Phase 1
```

---

## Phase 1 Completion Checklist

### Implementation

- [ ] Task 1.1: Event Emission (8-12 hrs)
  - [ ] TransactionService
  - [ ] PaymentService
  - [ ] ReservationService
  - [ ] TransferService
  - [ ] PotService
  - [ ] MemberService
  - [ ] CardAccountService
  - [ ] All routes updated with actorId
- [ ] Task 1.2: SSE Stream (6-8 hrs)

### Testing

- [ ] 21+ event emission tests passing
- [ ] 5+ SSE endpoint tests passing
- [ ] End-to-end: create transaction → event emitted → SSE streams it
- [ ] ACL filtering verified
- [ ] Multiple concurrent SSE connections work

### Validation

- [ ] All services emit events on operations
- [ ] Events include correct metadata
- [ ] SSE endpoint streams in real-time
- [ ] Frontend can connect and receive updates
- [ ] No performance degradation

---

## Next Steps

After Phase 1 completion:

1. Merge to main branch
2. Start Phase 2: Validation & Business Logic
3. Frontend can now build real-time UI features

---

_Last Updated: November 8, 2025_  
_Ready to implement after Phase 0_
