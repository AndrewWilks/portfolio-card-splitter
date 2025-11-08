# Phase 2: Validation & Business Logic - Specification

**Date**: November 8, 2025  
**Status**: 🟡 HIGH Priority  
**Estimated Time**: 19-25 hours  
**Priority**: Should complete before launch  
**Depends On**: Phase 0 (Authentication), Phase 1 (Events)

---

## Summary

Core CRUD operations work, but critical business logic and validation are missing or incomplete. This creates data integrity risks and broken user experiences. Currently:

- ❌ 34 validation tests failing
- ❌ Allocations can exceed 100% or transaction amount
- ❌ Payments can exceed transaction amount
- ❌ Reservations validation incomplete
- ❌ Pot ACL not enforced (SOLO pots visible to all)
- ❌ Balance calculations missing

This phase implements comprehensive validation, business rules, and security enforcement.

---

## Context

### Current State

**TransactionService**:

- ❌ Allocations not validated (can sum to != 100%)
- ❌ Can mix percentage and fixed allocations
- ❌ Member existence not checked
- ❌ Date serialization broken
- ❌ Tags not saved

**PaymentService**:

- ❌ Payment amount not validated against transaction
- ❌ Reconciliation flag logic missing
- ✅ 6 tests failing

**ReservationService**:

- ❌ Member existence not validated
- ❌ Allocation linkage not validated
- ❌ Amount can exceed allocation
- ❌ Total reservations can exceed transaction
- ❌ Pot balance not checked
- ✅ 9 tests failing

**PotService**:

- ❌ SOLO pot ACL not enforced (anyone can see)
- ❌ SHARED pot member checks missing
- ❌ enrichPots() not implemented
- ✅ 7 tests failing

**LedgerService**:

- ❌ getBalances() stub
- ❌ calculateSettlement() stub
- ❌ Outstanding balance calculations missing

---

## Requirements

### Functional Requirements

#### FR-1: Transaction Validation

**Allocation Validation**:

- Percentage allocations MUST sum to exactly 100%
- Fixed allocations MUST sum to exactly transaction amount
- CANNOT mix percentage and fixed allocations
- Each allocation MUST reference valid member
- Each allocation MUST have either percentage OR amountCents (XOR)

**Member Validation**:

- All members referenced in allocations MUST exist
- All members MUST belong to accessible pots

**Tag Handling**:

- Tags MUST be saved to database
- Existing tags reused, new tags created

#### FR-2: Payment Validation

**Amount Validation**:

- Payment amount MUST NOT exceed transaction amount
- Multiple payments to same transaction MUST NOT exceed total

**Reconciliation Logic**:

- Payment reconciled = true IF sum of payments to transaction >= transaction amount
- Payment reconciled = false otherwise
- Reconciliation status updated on all payments when new payment added

#### FR-3: Reservation Validation

**Existence Checks**:

- Member MUST exist
- Allocation MUST exist
- Transaction (via allocation) MUST exist

**Linkage Validation**:

- Reservation.allocationId MUST link to valid Allocation
- Allocation.transactionId MUST link to valid Transaction
- Reservation.memberId MUST match Allocation.memberId

**Amount Validation**:

- Reservation amount MUST NOT exceed allocation amount
- Total reservations for allocation MUST NOT exceed allocation amount
- Total reservations for transaction MUST NOT exceed transaction amount

**Pot Balance Check**:

- Reservation.potId MUST have sufficient balance
- Balance = pot.balanceCents - existing reservations

#### FR-4: Pot Access Control (ACL)

**SOLO Pots**:

- Visible ONLY to owner (ownerId = current user)
- Cannot be queried by other users
- List/get operations filter by ownerId

**SHARED Pots**:

- Visible to all members
- Members determined by pot membership
- Can be queried by any member

**Enforcement Points**:

- `PotService.list()` - filter by access
- `PotService.getById()` - check access
- `PotService.enrichPots()` - filter by access

#### FR-5: Ledger Calculations

**getBalances()**:

- Calculate outstanding balance per CardAccount
- Outstanding = sum(transactions) - sum(payments)
- Group by CardAccount
- Return map of cardAccountId → balance

**calculateSettlement()**:

- Determine who owes whom
- Based on allocations, payments, and reservations
- Return array of settlement transactions
- Minimize number of transactions

### Non-Functional Requirements

#### NFR-1: Data Integrity

- MUST validate BEFORE saving to database
- MUST return clear error messages
- MUST NOT allow invalid data to persist

#### NFR-2: Performance

- Validation MUST complete in <100ms per operation
- Balance calculations MUST be efficient (indexed queries)

#### NFR-3: Security

- ACL MUST be enforced at service layer
- MUST NOT leak pot data to unauthorized users

---

## Business Rules

### BR-1: Allocation Rules

- XOR: Allocation has percentage OR amountCents, never both
- Percentage allocations sum to 100%
- Fixed allocations sum to transaction amount
- Cannot mix types in same transaction

### BR-2: Payment Rules

- Sum of payments cannot exceed transaction amount
- Payment triggers reconciliation check on all transaction payments
- Reconciled flag calculated, not set manually

### BR-3: Reservation Rules

- Reservation amount ≤ allocation amount
- Total reservations ≤ transaction amount
- Pot must have sufficient balance
- Reservation locks pot funds

### BR-4: Pot Visibility

- SOLO: owner only
- SHARED: all members
- No exceptions

### BR-5: Balance Calculations

- Outstanding balance = transactions - payments
- Per CardAccount, not global
- Used for dashboard and alerts

---

## Validation Error Messages

### Transaction Validation

```typescript
// Allocation sum errors
"Percentage allocations must sum to exactly 100% (got {sum}%)";
"Fixed allocations must sum to transaction amount ${amount} (got ${sum})";
"Cannot mix percentage and fixed allocations";

// Member errors
"Member {memberId} does not exist";
"Member {memberId} not accessible";

// Allocation field errors
"Allocation must have either percentage or amountCents, not both";
"Allocation must have either percentage or amountCents";
```

### Payment Validation

```typescript
"Payment amount ${amount} exceeds transaction amount ${transactionAmount}";
"Total payments ${total} would exceed transaction amount ${transactionAmount}";
```

### Reservation Validation

```typescript
"Member {memberId} does not exist";
"Allocation {allocationId} does not exist";
"Reservation amount ${amount} exceeds allocation amount ${allocationAmount}";
"Reservation member {memberId} does not match allocation member {allocationMemberId}";
"Total reservations ${total} would exceed transaction amount ${transactionAmount}";
"Pot {potId} has insufficient balance. Available: ${available}, Required: ${amount}";
```

### Pot ACL

```typescript
"Pot {potId} not found or access denied";
"SOLO pot can only be accessed by owner";
```

---

## Testing Requirements

### Unit Tests

**TransactionService** (6 tests):

- ✅ Validates percentage allocations sum to 100%
- ✅ Validates fixed allocations sum to amount
- ✅ Rejects mixed allocation types
- ✅ Validates member existence
- ✅ Validates allocation XOR fields
- ✅ Saves tags correctly

**PaymentService** (4 tests):

- ✅ Validates payment ≤ transaction
- ✅ Validates total payments ≤ transaction
- ✅ Sets reconciled = true when sum >= amount
- ✅ Sets reconciled = false otherwise

**ReservationService** (9 tests):

- ✅ Validates member exists
- ✅ Validates allocation exists
- ✅ Validates reservation ≤ allocation
- ✅ Validates member matches allocation
- ✅ Validates total reservations ≤ transaction
- ✅ Validates pot balance
- ✅ Blocks reservation with insufficient balance
- ✅ Allows reservation with sufficient balance
- ✅ Updates multiple reservations correctly

**PotService** (7 tests):

- ✅ list() filters SOLO pots by owner
- ✅ list() returns SHARED pots for members
- ✅ getById() rejects non-owner for SOLO
- ✅ getById() allows member for SHARED
- ✅ enrichPots() filters by access
- ✅ enrichPots() calculates balances
- ✅ enrichPots() includes member counts

**LedgerService** (2 tests):

- ✅ getBalances() calculates per CardAccount
- ✅ calculateSettlement() minimizes transactions

### Integration Tests

- ✅ End-to-end allocation validation
- ✅ End-to-end payment reconciliation
- ✅ End-to-end reservation flow with pot balance
- ✅ End-to-end ACL enforcement

---

## Success Criteria

### Minimum Viable

- [ ] All 34 failing tests now passing
- [ ] Allocations validated before save
- [ ] Payments validated before save
- [ ] Basic ACL enforcement on pots

### Complete

- [ ] All validation rules implemented
- [ ] All business logic correct
- [ ] ACL enforced on all pot operations
- [ ] Balance calculations working
- [ ] No data integrity issues
- [ ] Clear, helpful error messages

---

## Out of Scope

The following are explicitly NOT included in Phase 2:

- ❌ Frontend validation (backend only)
- ❌ Batch validation (one-at-a-time)
- ❌ Validation warnings (errors only)
- ❌ Optimistic locking (race conditions)
- ❌ Transaction rollback on validation failure

---

## Dependencies

### Must Be Complete Before Starting

- ✅ Phase 0: Authentication (need user context for ACL)
- ✅ Phase 1: Events (validation emits events on errors)

### Blocks These Features

- 🟡 Production launch (data integrity required)
- 🟡 Multi-user testing (ACL required)
- 🟡 Financial reporting (accurate calculations required)

---

## Risk Assessment

### High Risk

- **Data corruption**: Without validation, bad data persists
  - _Mitigation_: Implement and test thoroughly

### Medium Risk

- **Performance**: Complex validation on every operation
  - _Mitigation_: Keep validation efficient, use indexes

### Low Risk

- **Validation bypass**: Frontend bypasses validation
  - _Mitigation_: Backend validation is authoritative

---

## Notes

1. **Validation Order**: Validate before emitting events. Don't create events for rejected operations.

2. **Error Handling**: Return 400 Bad Request with detailed validation error. Log but don't expose internal errors.

3. **ACL Philosophy**: Deny by default. Explicit permission required.

4. **Balance Calculations**: Cache if performance is issue. Start with real-time calculation.

5. **Settlement Algorithm**: Use greedy algorithm for MVP. Optimize later if needed.

---

_Last Updated: November 8, 2025_  
_Next: See implementation-plan.md for detailed task breakdown_
