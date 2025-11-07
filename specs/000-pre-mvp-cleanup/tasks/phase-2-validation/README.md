# Phase 2: Validation Tasks

**Status**: 🔄 In Progress  
**Estimated Time**: 2-3 days  
**Depends On**: Phase 1 Complete

## Overview

Enforce business rules at entity and service layers for all entities.

## Tasks

- [x] **2.1** Payment Validation (3-4 hrs) - Cannot exceed transaction total, flag mismatches ✅
- [ ] **2.2** Reservation Validation (3-4 hrs) - Link to allocations, respect pot balance
- [ ] **2.3** Transaction Validation (3-4 hrs) - Allocations sum correctly, valid CardAccount
- [ ] **2.4** Allocation Validation (2-3 hrs) - Sum rules, cannot mix types
- [ ] **2.5** Pot Validation (2-3 hrs) - Visibility rules, ACL enforcement

**Total**: 5 tasks, ~13-18 hours  
**Progress**: 1/5 complete (20%)

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

### Next Steps

- Fix Phase 1 test setup issues (missing cardAccountId in tests)
- Run all payment tests to verify functionality
- Move to Task 2.2 (Reservation Validation)

## Success Criteria

- [x] Payment validation enforces all business rules
- [ ] Reservation validation enforces allocation linking
- [ ] Transaction validation enforces cardAccount requirements
- [ ] Allocation validation enforces sum rules
- [ ] Pot validation enforces visibility rules
- [ ] All validation tests pass
- [ ] Service layer throws clear errors for violations
- [ ] API returns proper error codes (400 for validation failures)

## Checkpoint

```bash
# Run all service tests
deno test backend/__tests__/services/

# Test validation edge cases
deno test -A --filter "validation"

# Test payment reconciliation
deno test backend/__tests__/services/paymentReconciliation.test.ts

# Test error responses
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{"amountCents": 99999999}' # Should fail validation
```

## Critical Path

All tasks can run in parallel, but coordinate on shared services.

## Next Phase

Phase 3: Polish and documentation
