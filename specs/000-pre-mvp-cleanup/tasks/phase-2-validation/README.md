# Phase 2: Validation Tasks

**Status**: ✅ Complete  
**Estimated Time**: 2-3 days  
**Actual Time**: ~8 hours (1 day)  
**Depends On**: Phase 1 Complete

## Overview

Enforce business rules at entity and service layers for all entities.

## Tasks

- [x] **2.1** Payment Validation (3-4 hrs) - Cannot exceed transaction total, flag mismatches ✅
- [x] **2.2** Reservation Validation (3-4 hrs) - Link to allocations, respect pot balance ✅
- [x] **2.3** Transaction Validation (3-4 hrs) - Allocations sum correctly, valid CardAccount ✅
- [x] **2.4** Allocation Validation (2-3 hrs) - Sum rules, cannot mix types ✅
- [x] **2.5** Pot Validation (2-3 hrs) - Visibility rules, ACL enforcement ✅

**Total**: 5 tasks, ~13-18 hours  
**Progress**: 5/5 complete (100%) ✅

## Task 2.1 - Payment Validation ✅ COMPLETE

### Implementation Summary

Added reconciliation flagging to Payment entity to detect when actual payments differ from reservations:

**Schema Changes:**

- Added `needs_reconciliation` boolean field to payments table (default: false)
- Updated Payment entity interface to include `needsReconciliation: boolean`
- Added migration: `0000_add_needs_reconciliation_to_payments.sql`

**Service Logic:**

- PaymentService.createPayment now calculates reconciliation flag
- Logic: Compare total payments (including current) against total reservations
- If no reservations exist → no reconciliation needed (false)
- If reservations exist and totals match → no reconciliation needed (false)
- If reservations exist and totals differ → reconciliation needed (true)

**Test Coverage:**

- Created `paymentReconciliation.test.ts` with 4 comprehensive test scenarios:
  1. ✅ Flags when payment differs from reservations
  2. ✅ No flag when payment matches reservations
  3. ✅ No flag when no reservations exist
  4. ✅ Multiple partial payments scenario

**Business Rules Enforced:**

1. ✅ Payment cannot exceed transaction total (already implemented)
2. ✅ Payment must link to valid pot and transaction (already implemented)
3. ✅ Flag if differs from reservations (NEW - implemented)

### Files Modified

**Entities:**

- `shared/entities/payment.ts` - Added needsReconciliation field and getter
- `backend/db/schema/tables/payment.ts` - Added column definition

**Services:**

- `backend/services/paymentService.ts` - Added reconciliation calculation logic

**Tests:**

- `backend/__tests__/services/paymentReconciliation.test.ts` - New comprehensive test suite

**Migrations:**

- `backend/db/migrations/0000_add_needs_reconciliation_to_payments.sql` - Database migration

**Time:** ~1.5 hours

## Completed Work

### Task 2.5: Pot Validation ✅

**Implementation Summary:**
Implemented comprehensive ACL (Access Control List) enforcement in PotService for both SOLO and SHARED pots:

**ACL Rules:**

- ✅ Owner always has full access (READ and MANAGE) to their pots
- ✅ SOLO pots: Only owner can see or manage (complete privacy)
- ✅ SHARED pots: Access controlled via visibilityAcls map
- ✅ READ access: Can list and view pot details
- ✅ MANAGE access: Can update and deposit (inherits READ)
- ✅ Users without ACL entries cannot access SHARED pots

**Operations Protected:**

- listPots(): Filters based on visibility
- getPot(): Requires READ access
- updatePot(): Requires MANAGE access
- deposit(): Requires MANAGE access

**Derived Values:**

- Always enriches pots with reservedCents/availableCents
- Values calculated from reservations, not persisted
- Included in toJSON serialization

**Changes:**

- `backend/services/potService.ts` - Complete implementation with ACL enforcement
- `backend/di/services.ts` - Wired ReservationRepository to PotService
- `backend/__tests__/services/potAclValidation.test.ts` - NEW test file (7 scenarios)

**Time:** ~2.5 hours

---

### Task 2.4: Allocation Validation ✅

**Implementation Summary:**
Allocation validation already implemented in entity layer. No AllocationService exists as allocations are created through TransactionService.

**Existing Validation:**

- ✅ XOR constraint: Cannot have both basisPoints and amountCents (in Allocation.create())
- ✅ Rule enforcement: FIXED_AMOUNT requires amountCents, basisPoints requires basisPoints
- ✅ Cannot mix types: Validated in TransactionService.validateAllocations()
- ✅ Sum rules: Percentage allocations must sum to 100%, fixed must not exceed total (in TransactionService)

**Added:**

- Test for XOR constraint validation
- Test verifies error message clarity

**Changes:**

- `shared/__tests__/entities/allocation.test.ts` - Added XOR validation test

**Time:** ~30 minutes (most validation already existed)

---

### Task 2.3: Transaction Validation ✅

**Implementation Summary:**
Discovered that TransactionService already had comprehensive validation for most requirements:

- ✅ Merchant existence validation
- ✅ CardAccount existence validation
- ✅ Card exists and belongs to CardAccount
- ✅ Tag existence validation
- ✅ Allocations sum to 100% (percentage type)
- ✅ Fixed allocations don't exceed transaction total
- ✅ Cannot mix percentage and fixed allocation types
- ✅ At least one allocation required

**Added:**

- Member existence validation for all allocations
- MemberRepository dependency via DI
- Comprehensive test suite (6 scenarios)

**Changes:**

- `backend/services/transactionService.ts` - Added member validation loop
- `backend/di/services.ts` - Wired MemberRepository
- `backend/__tests__/services/transactionValidation.test.ts` - NEW test file

**Time:** ~1.5 hours

---

### Task 2.2: Reservation Validation ✅

### Implementation Summary

Added comprehensive validation to ReservationService to enforce business rules around reservations:

**Service Logic:**

- Validates allocation exists if provided
- Validates allocation belongs to the correct transaction
- Validates allocation belongs to the correct member
- Validates reservation amount doesn't exceed allocation amount
- Validates single reservation doesn't exceed transaction total
- Validates total reservations won't exceed transaction amount
- Validates pot has sufficient balance for reservation

**Business Rules Enforced:**

1. ✅ Pot exists validation (already implemented)
2. ✅ Transaction exists validation (already implemented)
3. ✅ Member exists validation (already implemented)
4. ✅ Allocation exists validation (NEW)
5. ✅ Allocation belongs to transaction (NEW)
6. ✅ Allocation belongs to member (NEW)
7. ✅ Reservation ≤ allocation amount (NEW)
8. ✅ Total reservations ≤ transaction amount (NEW)
9. ✅ Pot has sufficient balance (NEW)

**Test Coverage:**

- Created `reservationValidation.test.ts` with 7 comprehensive test scenarios:
  1. ✅ Validates allocation exists
  2. ✅ Validates allocation belongs to transaction
  3. ✅ Validates allocation belongs to member
  4. ✅ Validates reservation doesn't exceed allocation amount
  5. ✅ Validates total reservations don't exceed transaction amount
  6. ✅ Validates pot has sufficient balance
  7. ✅ Success case with all validations passing

### Files Modified

**Services:**

- `backend/services/reservationService.ts` - Added 9 validation checks
- `backend/di/services.ts` - Added AllocationRepository to ReservationService DI

**Repositories:**

- `backend/di/repositories.ts` - Added AllocationRepository import and factory function

**Tests:**

- `backend/__tests__/services/reservationValidation.test.ts` - NEW (7 comprehensive tests)

**Documentation:**

- `specs/000-pre-mvp-cleanup/tasks/phase-2-validation/README.md` - Updated with Task 2.2 complete

**Time:** ~2 hours

## Success Criteria

- [x] Payment validation enforces all business rules ✅
- [x] Reservation validation enforces allocation linking ✅
- [x] Transaction validation enforces cardAccount requirements ✅
- [x] Allocation validation enforces sum rules ✅
- [x] Pot validation enforces visibility rules ✅
- [x] All validation tests pass ✅
- [x] Service layer throws clear errors for violations ✅
- [x] API returns proper error codes (400 for validation failures) ✅

**All success criteria met! Phase 2 complete.** 🎉

## Checkpoint

**Phase 2 Complete!** All validation tests passing. ✅

```bash
# Verify all service tests pass
deno test backend/__tests__/services/

# Specifically test validation implementations
deno test backend/__tests__/services/paymentReconciliation.test.ts
deno test backend/__tests__/services/reservationValidation.test.ts
deno test backend/__tests__/services/transactionValidation.test.ts
deno test backend/__tests__/services/potAclValidation.test.ts
deno test shared/__tests__/entities/allocation.test.ts
```

## Phase 2 Summary

**Completed**: All 5 validation tasks (100%)  
**Time**: ~8 hours actual vs 13-18 hours estimated  
**Commits**: 6 (5 features + 1 dev diary)  
**Test Coverage**: 24 comprehensive test scenarios across 4 new test suites

**Key Achievements:**

- ✅ Service-layer validation with cross-entity checks
- ✅ ACL enforcement pattern established (Pot visibility)
- ✅ Derived values pattern working well
- ✅ Comprehensive error messages
- ✅ Full test coverage

## Next Phase

Ready to move to the next phase of pre-MVP cleanup. Review `specs/000-pre-mvp-cleanup/spec.md` to determine priorities.
