# Phase 1: Events & Real-Time Updates - Specification

**Date**: November 8, 2025  
**Status**: 🔴 CRITICAL - Required for MVP  
**Estimated Time**: 14-20 hours  
**Priority**: HIGH  
**Depends On**: Phase 0 (Authentication)

---

## Summary

The MVP requires real-time collaborative features where multiple users see updates instantly. Currently:

- ❌ No services emit events (EventRepository unused)
- ❌ SSE endpoint returns 501 Not Implemented
- ❌ No audit trail being created
- ❌ Frontend cannot receive live updates

This phase implements event emission across all services and creates Server-Sent Events (SSE) infrastructure for real-time updates.

---

## Context

### Current State

**EventRepository** (`backend/repositories/eventRepository.ts`):

- ✅ Fully implemented
- ✅ Database table exists
- ❌ Never called by any service

**Event Entity** (`shared/entities/event.ts`):

- ✅ Fully implemented with Zod validation
- ❌ Never instantiated except in tests

**SSE Route** (`backend/routes/events/api_events_stream.ts`):

- Exists but returns 501 Not Implemented
- No streaming logic

**Services**:

- All CRUD operations work
- None emit events on create/update/delete operations
- No audit trail being generated

### Why This Matters

**Real-Time Collaboration**:

- Multiple users managing shared expenses
- User A adds transaction → User B sees it immediately
- User A makes payment → User B sees pot balance update
- Critical for trust in shared financial data

**Audit Trail**:

- Track who did what and when
- Required for disputes ("Who marked this paid?")
- Debugging data issues
- Compliance and accountability

**User Experience**:

- No page refreshes needed
- Immediate feedback on actions
- See other users' activity in real-time

---

## Requirements

### Functional Requirements

#### FR-1: Event Emission

- All create, update, delete operations MUST emit events
- Events MUST include:
  - `entityType`: Type of entity (transaction, payment, etc.)
  - `entityId`: UUID of affected entity
  - `eventType`: Operation type (created, updated, deleted)
  - `actorId`: User who performed action
  - `metadata`: Relevant operation details (amounts, status changes, etc.)
  - `createdAt`: Timestamp

#### FR-2: Server-Sent Events (SSE)

- SSE endpoint MUST stream events in real-time
- MUST support filtering by timestamp (for reconnection)
- MUST use proper SSE format: `data: {json}\n\n`
- MUST handle client disconnection gracefully
- MUST poll for new events at reasonable interval (2 seconds)

#### FR-3: Event History

- All events MUST be persisted to database
- MUST support querying events by:
  - Entity type
  - Entity ID
  - Actor ID
  - Time range
  - Event type

#### FR-4: Metadata Standards

Each entity type has specific metadata requirements:

**Transaction Events**:

```typescript
metadata: {
  amountCents: number,
  merchant: string,
  type: TransactionType
}
```

**Payment Events**:

```typescript
metadata: {
  amountCents: number,
  potId: string,
  transactionId: string,
  reconciled: boolean
}
```

**Pot Events**:

```typescript
metadata: {
  name: string,
  type: PotType,
  balanceCents?: number
}
```

**Member Events**:

```typescript
metadata: {
  name: string,
  role: MemberRole
}
```

### Non-Functional Requirements

#### NFR-1: Performance

- Event emission MUST NOT significantly slow down operations (<10ms overhead)
- SSE polling MUST NOT overload database (batch queries)
- SSE connection MUST support 100+ concurrent clients

#### NFR-2: Reliability

- Failed event emission MUST NOT block primary operation
- MUST log event emission failures
- SSE disconnection MUST be recoverable (timestamp-based catch-up)

#### NFR-3: Security

- SSE endpoint MUST require authentication
- Users MUST only see events for pots they have access to (ACL)
- Event metadata MUST NOT leak sensitive data

---

## Business Rules

### BR-1: Event Scope

- User events: visible to all authenticated users
- Pot events: visible only to pot members (ACL enforcement)
- Transaction events: visible if related pot is accessible
- Member events: visible to all pot members
- System events: visible to all

### BR-2: Event Retention

- Events stored indefinitely (audit requirement)
- Consider archiving strategy for events >1 year old (future)

### BR-3: Actori Tracking

- All operations MUST have actorId (from session)
- System operations use actorId = null
- Bootstrap operations use actorId = null

---

## API Endpoints

### GET /api/events/stream

**Purpose**: Real-time event stream via SSE

**Auth**: Required

**Query Parameters**:

- `since` (optional): ISO timestamp - only return events after this time

**Response**: SSE stream

**Example Stream**:

```
data: {"id":"uuid","entityType":"transaction","entityId":"uuid","eventType":"created","actorId":"uuid","metadata":{"amountCents":5000,"merchant":"Coffee Shop"},"createdAt":"2025-11-08T10:00:00Z"}

data: {"id":"uuid","entityType":"payment","entityId":"uuid","eventType":"created","actorId":"uuid","metadata":{"amountCents":2500,"potId":"uuid","reconciled":false},"createdAt":"2025-11-08T10:01:00Z"}
```

**Headers**:

```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

---

## Events to Emit

### Transaction Service

**createTransaction()**:

```typescript
Event {
  entityType: "transaction",
  entityId: transaction.id,
  eventType: "created",
  actorId: actorId,
  metadata: {
    amountCents: transaction.amountCents,
    merchant: transaction.merchant,
    type: transaction.type
  }
}
```

**updateTransaction()**:

```typescript
Event {
  entityType: "transaction",
  entityId: transaction.id,
  eventType: "updated",
  actorId: actorId,
  metadata: {
    changes: { field: "old → new" }
  }
}
```

**deleteTransaction()**:

```typescript
Event {
  entityType: "transaction",
  entityId: transactionId,
  eventType: "deleted",
  actorId: actorId,
  metadata: {}
}
```

### Payment Service

**createPayment()**:

```typescript
Event {
  entityType: "payment",
  entityId: payment.id,
  eventType: "created",
  actorId: actorId,
  metadata: {
    amountCents: payment.amountCents,
    potId: payment.potId,
    transactionId: payment.transactionId,
    reconciled: payment.reconciled
  }
}
```

### Reservation Service

**createReservation()**, **updateReservation()**, **deleteReservation()**:

```typescript
Event {
  entityType: "reservation",
  entityId: reservation.id,
  eventType: "created" | "updated" | "deleted",
  actorId: actorId,
  metadata: {
    amountCents: reservation.amountCents,
    potId: reservation.potId,
    allocationId: reservation.allocationId
  }
}
```

### Transfer Service

**createTransfer()**:

```typescript
Event {
  entityType: "transfer",
  entityId: transfer.id,
  eventType: "created",
  actorId: actorId,
  metadata: {
    amountCents: transfer.amountCents,
    fromPotId: transfer.fromPotId,
    toPotId: transfer.toPotId,
    type: transfer.type
  }
}
```

### Pot Service

**createPot()**, **updatePot()**:

```typescript
Event {
  entityType: "pot",
  entityId: pot.id,
  eventType: "created" | "updated",
  actorId: actorId,
  metadata: {
    name: pot.name,
    type: pot.type,
    balanceCents: pot.balanceCents
  }
}
```

### Member Service

**createMember()**, **updateMember()**, **archiveMember()**:

```typescript
Event {
  entityType: "member",
  entityId: member.id,
  eventType: "created" | "updated" | "archived",
  actorId: actorId,
  metadata: {
    name: member.name,
    role: member.role,
    isArchived: member.isArchived
  }
}
```

### CardAccount Service

**createCardAccount()**, **updateCardAccount()**:

```typescript
Event {
  entityType: "cardaccount",
  entityId: cardAccount.id,
  eventType: "created" | "updated",
  actorId: actorId,
  metadata: {
    name: cardAccount.name,
    issuer: cardAccount.issuer,
    last4: cardAccount.last4
  }
}
```

---

## Testing Requirements

### Unit Tests

**Event Emission Tests** (add to existing service tests):

- ✅ createTransaction emits event
- ✅ updateTransaction emits event
- ✅ deleteTransaction emits event
- ✅ Event contains correct metadata
- ✅ Event has actorId
- ✅ Repeat for all services (7 services × 3 operations = 21 tests minimum)

### Integration Tests

**SSE Route** (`backend/__tests__/routes/events/api_events_stream.test.ts`):

- ✅ Requires authentication
- ✅ Streams events in SSE format
- ✅ Respects `since` parameter
- ✅ Handles client disconnection
- ✅ Filters events by ACL (user only sees accessible data)
- ✅ Polls for new events
- ✅ Multiple clients can connect simultaneously

### End-to-End Tests

- ✅ User A creates transaction → User B's SSE stream receives event
- ✅ User A makes payment → Event emitted with correct metadata
- ✅ Disconnected client reconnects with `since` param → catches up on missed events

---

## Success Criteria

### Minimum Viable

- [ ] All 7 core services emit events on create/update/delete
- [ ] SSE endpoint streams events in real-time
- [ ] Events persisted to database
- [ ] Frontend can connect and receive updates

### Complete

- [ ] All 21+ event emission tests passing
- [ ] SSE endpoint fully functional with authentication
- [ ] SSE supports timestamp-based reconnection
- [ ] Events include all required metadata
- [ ] ACL enforced on event visibility
- [ ] SSE handles 100+ concurrent connections
- [ ] No performance degradation from event emission

---

## Out of Scope

The following are explicitly NOT included in Phase 1:

- ❌ WebSockets (SSE is simpler for server→client)
- ❌ Event replay/rewind functionality
- ❌ Event aggregation or analytics
- ❌ Email notifications on events
- ❌ Webhook delivery to external systems
- ❌ Event schema versioning

---

## Dependencies

### Must Be Complete Before Starting

- ✅ Phase 0: Authentication (need actorId from session)
- ✅ EventRepository implemented
- ✅ Event entity defined

### Blocks These Features

- 🟡 Audit trail UI (can build but no data)
- 🟡 Real-time collaboration features
- 🟡 Activity feeds

---

## Risk Assessment

### High Risk

- **Performance**: Event emission adds overhead to every operation
  - _Mitigation_: Make event saving non-blocking, batch if needed

### Medium Risk

- **SSE scalability**: Many concurrent connections
  - _Mitigation_: Test with 100+ clients, consider event aggregation

### Low Risk

- **Event metadata inconsistency**: Different services emit different formats
  - _Mitigation_: Document standards, validate in tests

---

## Notes

1. **SSE vs WebSocket**: SSE chosen for simplicity. Server→client only. WebSocket if we need client→server real-time later.

2. **Event Emission Pattern**: Create Event → Save to repository. Keep it simple. Don't over-engineer.

3. **ACL Filtering**: SSE stream must filter events based on user's pot access. Complex but critical for security.

4. **Polling Interval**: 2 seconds is reasonable balance. Too fast = database load. Too slow = not real-time.

5. **Error Handling**: If event emission fails, log but don't block operation. Primary operation success is more important.

---

_Last Updated: November 8, 2025_  
_Next: See implementation-plan.md for detailed task breakdown_
