# Phase 3: Polish & Minor Features - TODO

**Date**: November 8, 2025  
**Status**: ⏳ DEFERRED - Not required for MVP  
**Estimated Time**: 4-6 hours  
**Priority**: LOW

---

## Summary

Phase 3 covers polish items and minor features that can be implemented post-MVP launch. This phase has been **intentionally skipped** during initial MVP implementation to focus on critical functionality (Auth, Events, Validation).

---

## Planned Scope

Based on IMPLEMENTATION-ROADMAP.md, Phase 3 would include:

### 1. AuditService Implementation (2-3 hrs)

**Current State**: Stub implementation

**Planned Work**:

- Implement `getAuditTrail()` method
- Support filtering by:
  - Entity type
  - Entity ID
  - Actor ID
  - Date range
  - Event type
- Inject EventRepository
- Uncomment audit route in routes/index.ts
- Add pagination support

**Files**:

- `backend/services/auditService.ts`
- `backend/routes/audit/api_audit_trail.ts`

---

### 2. MemberService Enhancements (1 hr)

**Planned Work**:

- Add validation for archiving members
- Prevent archiving if member has active reservations
- Prevent archiving if member is last in pot
- Add soft delete support

**Files**:

- `backend/services/memberService.ts`

---

### 3. MerchantService Filtering (1 hr)

**Planned Work**:

- Add search/filter capabilities
- Filter by name (partial match)
- Filter by category
- Sort options
- Add pagination

**Files**:

- `backend/services/merchantService.ts`
- `backend/routes/merchants/api_merchants_list.ts`

---

### 4. Test Fixes & Cleanup (2 hrs)

**Planned Work**:

- Fix any remaining flaky tests
- Improve test isolation in UserRepository tests
- Add missing edge case tests
- Improve test data factories

**Files**:

- `backend/__tests__/repositories/userRepository.test.ts`
- Various test files

---

## Why Deferred

Phase 3 items are **non-blocking** for MVP:

✅ **MVP Can Launch Without**:

- AuditService UI can be built later; events are being collected
- Member archiving works, just lacks edge case validation
- Merchant filtering is nice-to-have; basic CRUD works
- Test fixes are improvements, not blockers (176 tests passing)

🔴 **MVP Cannot Launch Without**:

- ✅ Phase 0: Authentication (completed)
- ✅ Phase 1: Events & SSE (completed)
- ✅ Phase 2: Validation (completed)

---

## When to Implement

Implement Phase 3 when:

1. **Post-MVP Launch**: After users are successfully using the system
2. **Feature Request**: Users ask for audit trail UI or better merchant search
3. **Production Issues**: If member archiving causes problems
4. **Polish Sprint**: Dedicated time for refinements

---

## How to Resume

When ready to implement Phase 3:

1. Review this document
2. Create `phase-3-polish/spec.md` with detailed requirements
3. Create `phase-3-polish/implementation-plan.md` with task breakdown
4. Follow same patterns as Phase 0-2
5. Estimate 4-6 hours total

---

## Documentation to Create Later

When implementing Phase 3, create:

- [ ] `specs/001-mvp-specification/phase-3-polish/spec.md`
- [ ] `specs/001-mvp-specification/phase-3-polish/implementation-plan.md`
- [ ] Update REVIEW.md to include Phase 3 status
- [ ] Update IMPLEMENTATION-ROADMAP.md completion status

---

## Notes

- Phase 3 is **optional** and **low priority**
- Focus remains on Phase 0 → Phase 1 → Phase 2
- After Phase 2, MVP is **production-ready**
- Phase 3 can be done incrementally post-launch

---

_Created: November 8, 2025_  
_Status: Documented for future reference_
