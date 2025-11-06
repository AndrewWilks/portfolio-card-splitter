# Phase 2: Validation Tasks

**Status**: ⬜ Not Started  
**Estimated Time**: 2-3 days  
**Depends On**: Phase 1 Complete

## Overview

Enforce business rules at entity and service layers for all entities.

## Tasks

- [ ] **2.1** Payment Validation (3-4 hrs) - Cannot exceed transaction total, flag mismatches
- [ ] **2.2** Reservation Validation (3-4 hrs) - Link to allocations, respect pot balance
- [ ] **2.3** Transaction Validation (3-4 hrs) - Allocations sum correctly, valid CardAccount
- [ ] **2.4** Allocation Validation (2-3 hrs) - Sum rules, cannot mix types
- [ ] **2.5** Pot Validation (2-3 hrs) - Visibility rules, ACL enforcement

**Total**: 5 tasks, ~13-18 hours

## Success Criteria

- [ ] Payment validation enforces all business rules
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

# Test error responses
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{"amountCents": 99999999}' # Should fail validation
```

## Critical Path

All tasks can run in parallel, but coordinate on shared services.

## Next Phase

Phase 3: Polish and documentation
