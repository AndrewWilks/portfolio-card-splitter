# Phase 3: Polish Tasks

**Status**: 🔄 In Progress (Test Suite Fixes)  
**Estimated Time**: 1-2 days  
**Actual Time**: ~6 hours (documentation + test fixes in progress)  
**Depends On**: Phase 2 Complete

## Overview

Finalize implementation, update documentation, and verify all specs are met.

## Tasks

- [x] **3.1** Service Refinements (2-3 hrs) - Ledger calculations per CardAccount ✅ Complete (Time: ~2 hours)
- [x] **3.2** Entity Documentation (2-3 hrs) - Document relationships, update comments ✅ Complete (Time: ~1.5 hours)
- [x] **3.3** Architecture Docs (2-3 hrs) - Add CardAccount/Card to specs ✅ Complete (Time: ~1 hour)
- [x] **3.4** Gap Analysis Update (1-2 hrs) - Check off completed items ✅ Complete (Time: ~1 hour)
- [x] **3.5** Shared Entity Test Fixes (1 hr) - Fix Payment/Reservation/Token tests ✅ Complete (Commit: 211caac)
- [x] **3.6** Entity Getters & MemberService (1 hr) - Add property getters, fix MemberService ✅ Complete (Commits: ac2ae1f, 62ad1bf, 9981b35)
- [ ] **3.7** Backend Test Fixes (3-4 hrs) - Fix remaining validation/integration tests ⏸️ Paused

**Total**: 7 tasks, 6 complete, 3-4 hours remaining

## Completed Test Fixes (Commits: 211caac, ac2ae1f, 62ad1bf, 9981b35)

### Shared Entity Fixes ✅
- Payment tests: Added required `needsReconciliation` and `createdById` fields
- Reservation tests: Added required `createdById` field  
- Token test: Changed from private `markUsed()` to public `use()` method
- Member entity: Added `userId`, `displayName`, `archived` getters
- Merchant entity: Added `name`, `location`, `mergedIntoId` getters
- Tag entity: Added `name`, `color` getters

### Backend Service/DI Fixes ✅
- MemberRepository: Added `findByUserId()` method
- MemberService: Fixed entity instantiation (use `new Member()` instead of `create/from`)
- MemberService: Removed invalid `override` keywords
- MemberService: Fixed return type handling for `findAll()`
- AuthService: Added constructor with repository injections (was commented out)
- DI services: Uncommented `createAuthService()` implementation
- DI routes: Removed undefined `schemas.QuerySchema` reference

## Remaining Test Fixes (Known Issues)

### Backend Validation/Integration Tests (~150 errors)
- **CardAccount inserts**: Many tests insert invalid `potId` field into card_accounts table
- **Allocation inserts**: Tests try to add `createdById` field (not in schema)
- **Schema validation**: Multiple tests use undefined validation schemas
- **Route handlers**: Some routes expect different parameters than provided
- **UserService routes**: Expect 2 args but receiving 3 (params issue)

These remaining errors are in test files that haven't been run/updated since Phase 1-2 schema changes. Core implementations (entities, repositories, services) are solid.

## Success Criteria

- [x] LedgerService calculates outstanding balance per CardAccount ✅
- [x] All entity relationships documented ✅ (7 core entities with comprehensive JSDoc)
- [x] Architecture docs updated with new entities ✅ (9 sections updated in architecture.md)
- [x] Gap analysis spec shows all items complete ✅
- [x] Shared entity tests pass ✅
- [x] Entity property access working ✅ (getters added)
- [x] MemberService implementation fixed ✅
- [x] AuthService instantiable ✅
- [ ] Backend validation/integration tests pass (~150 errors remain)
- [ ] Full test suite passes
- [ ] Manual testing complete

## Checkpoint

```bash
# Full test suite
deno test

# Check test coverage
deno test --coverage

# Manual smoke tests
# - Create CardAccount
# - Create Card
# - Create Transaction with cardAccountId
# - Create Allocation
# - Create Reservation with allocationId
# - Create Payment with paidOn
# - View ledger balances per CardAccount
```

## Final Verification

- [ ] All Phase 0 tasks complete
- [ ] All Phase 1 tasks complete
- [ ] All Phase 2 tasks complete
- [ ] All Phase 3 tasks complete
- [ ] Gap analysis shows 0 missing items
- [ ] Architecture docs match implementation
- [ ] Test coverage meets goals (Entity 100%, Repo 90%, Service 90%, Route 85%)

## Project Complete! 🎉

When all tasks done:

- [ ] Merge feature branch to master
- [ ] Update project README
- [ ] Update CHANGELOG
- [ ] Tag release
- [ ] Deploy to production (if applicable)
