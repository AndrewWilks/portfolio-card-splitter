# 📋 **Complete Backend MVP Implementation Plan**

## 🎯 **Overview**

This plan outlines the systematic completion of the Portfolio Card Splitter
backend MVP through focused TDD sprints. The goal is to implement all business
logic while maintaining the established Clean Architecture, SOLID principles,
and comprehensive test coverage.

## 📊 **Sprint Plan**

### **Sprint 1: Merchants & Tags Foundation**

**Goal:** Establish TDD patterns and implement foundational entities
**Duration:** 2-3 days **Priority:** HIGH (Required for transactions)

### **Sprint 2: People/Members Management**

**Goal:** Complete user/member CRUD operations **Duration:** 2-3 days
**Priority:** HIGH (Core user management)

### **Sprint 3: Transaction Management**

**Goal:** Implement core expense tracking with allocations **Duration:** 4-5
days **Priority:** CRITICAL (Main app feature)

### **Sprint 4: Pot Management**

**Goal:** Money pot CRUD and deposit operations **Duration:** 3-4 days
**Priority:** HIGH (Financial management)

### **Sprint 5: Transfers & Payments**

**Goal:** Financial operations between pots **Duration:** 3-4 days **Priority:**
HIGH (Money movement)

### **Sprint 6: Reservations**

**Goal:** Fund reservation system **Duration:** 2-3 days **Priority:** MEDIUM
(Planned spending)

### **Sprint 7: Ledger & Audit**

**Goal:** Reporting and audit trail features **Duration:** 2-3 days
**Priority:** MEDIUM (Read-only features)

### **Sprint 8: Authentication Completion**

**Goal:** Polish auth flows and edge cases **Duration:** 2-3 days **Priority:**
MEDIUM (User experience)

### **Sprint 9: Event Streaming**

**Goal:** Real-time updates via SSE **Duration:** 2-3 days **Priority:** LOW
(Nice-to-have)

## 🔄 **Git Version Control Plan**

### **Branching Strategy**

- **Base Branch:** `master` (production-ready code)
- **Feature Branches:** `feature/{domain}-{operation}` (e.g.,
  `feature/merchants-crud`)
- **Chore Branches:** `chore/{task}` (e.g., `chore/fix-ci-issues`)

### **Sprint Workflow**

Keep this file upto date with progress of each sprint. tracking the status and
overview of the sprint where it is at, complated tasks, and any blockers
encountered.

1. **Create Branch:** `git checkout -b feature/{sprint-name}` from `Master`
2. **TDD Implementation:** Write the test and ensure Red → Green → Refactor
   cycle
3. **Commit Strategy:**
   - `feat: implement {feature} repository`
   - `feat: implement {feature} service`
   - `feat: implement {feature} routes`
   - `test: add {feature} tests`
4. **Devlog:** Create or update a devlog entry summarising the sprint's
   progress, challenges, and learnings. Following the `devlog-specification.md`
   guidelines and only create a new devlog entry for significant milestones or
   sprint completions otherwise update existing relevant entries.
5. **CI:** Ensure all tests pass, CI checks are green and all problems are
   fixed, before PR submission.
6. **Docs:** Ensure any relevant documentation (e.g., API contracts, data
   models) is updated to reflect new implementations or changes.
7. **Pull Request:** Create PR targeting `master` with GitHub CLI
8. **Code Review:** Address feedback, ensure CI passes
9. **Merge:** Squash merge with descriptive commit message

### **Quality Gates**

- ✅ All tests pass (137+ tests)
- ✅ CI pipeline green (format, lint, type-check, test)
- ✅ Code review approval
- ✅ API contracts match implementation
- ✅ Data model relationships correct

## 📈 **Implementation Tracker**

### **Sprint 1: Merchants & Tags**

| Component      | File                                                        | Status         | Implementation Notes            |
| -------------- | ----------------------------------------------------------- | -------------- | ------------------------------- |
| **Repository** | `backend/repositories/merchantRepository.ts`                | ✅ Implemented | CRUD operations with DB queries |
| **Repository** | `backend/repositories/tagRepository.ts`                     | ✅ Implemented | CRUD operations with DB queries |
| **Service**    | `backend/services/merchantService.ts`                       | ✅ Implemented | Business logic, validation      |
| **Service**    | `backend/services/tagService.ts`                            | ✅ Implemented | Business logic, validation      |
| **Routes**     | `backend/routes/merchants/api_merchants_*.ts`               | ✅ Implemented | GET/POST/PATCH handlers         |
| **Routes**     | `backend/routes/tags/api_tags_*.ts`                         | ✅ Implemented | GET/POST/PATCH handlers         |
| **Tests**      | `backend/__tests__/repositories/merchantRepository.test.ts` | ✅ Implemented | TDD implementation completed    |
| **Tests**      | `backend/__tests__/services/merchantService.test.ts`        | ✅ Implemented | TDD implementation completed    |

### **Sprint 2: People/Members**

| Component      | File                                                      | Status         | Implementation Notes    |
| -------------- | --------------------------------------------------------- | -------------- | ----------------------- |
| **Repository** | `backend/repositories/memberRepository.ts`                | ✅ Implemented | User/member CRUD        |
| **Service**    | `backend/services/memberService.ts`                       | ✅ Implemented | Member management logic |
| **Routes**     | `backend/routes/people/api_people_*.ts`                   | ✅ Implemented | Member CRUD endpoints   |
| **Tests**      | `backend/__tests__/repositories/memberRepository.test.ts` | ✅ Implemented | TDD implementation      |
| **Tests**      | `backend/__tests__/services/memberService.test.ts`        | ✅ Implemented | TDD implementation      |

### **Sprint 3: Transactions**

| Component      | File                                                           | Status         | Implementation Notes                       |
| -------------- | -------------------------------------------------------------- | -------------- | ------------------------------------------ |
| **Repository** | `backend/repositories/transactionRepository.ts`                | ✅ Implemented | Complex queries with allocations           |
| **Service**    | `backend/services/transactionService.ts`                       | ✅ Implemented | Allocation logic, merchant/tag association |
| **Routes**     | `backend/routes/transactions/api_transactions_*.ts`            | ✅ Implemented | Transaction CRUD with allocations          |
| **Tests**      | `backend/__tests__/repositories/transactionRepository.test.ts` | ✅ Implemented | Complex allocation testing                 |
| **Tests**      | `backend/__tests__/services/transactionService.test.ts`        | ✅ Implemented | Business logic testing                     |

### **Sprint 4: Pots**

| Component      | File                                                   | Status             | Implementation Notes           |
| -------------- | ------------------------------------------------------ | ------------------ | ------------------------------ |
| **Repository** | `backend/repositories/potRepository.ts`                | ❌ Not Implemented | Pot CRUD, balance calculations |
| **Service**    | `backend/services/potService.ts`                       | ❌ Not Implemented | Pot management, deposit logic  |
| **Routes**     | `backend/routes/pots/api_pots_*.ts`                    | ❌ Not Implemented | Pot CRUD, deposit endpoint     |
| **Tests**      | `backend/__tests__/repositories/potRepository.test.ts` | ✅ Scaffolded      | Balance calculation testing    |
| **Tests**      | `backend/__tests__/services/potService.test.ts`        | ✅ Scaffolded      | Deposit logic testing          |

### **Sprint 5: Transfers & Payments**

| Component      | File                                               | Status             | Implementation Notes |
| -------------- | -------------------------------------------------- | ------------------ | -------------------- |
| **Repository** | `backend/repositories/transferRepository.ts`       | ❌ Not Implemented | Transfer operations  |
| **Repository** | `backend/repositories/paymentRepository.ts`        | ❌ Not Implemented | Payment operations   |
| **Service**    | `backend/services/transferService.ts`              | ❌ Not Implemented | Transfer validation  |
| **Service**    | `backend/services/paymentService.ts`               | ❌ Not Implemented | Payment processing   |
| **Routes**     | `backend/routes/transfers/api_transfers_create.ts` | ❌ Not Implemented | Transfer creation    |
| **Routes**     | `backend/routes/payments/api_payments_create.ts`   | ❌ Not Implemented | Payment creation     |

### **Sprint 6: Reservations**

| Component      | File                                                | Status             | Implementation Notes       |
| -------------- | --------------------------------------------------- | ------------------ | -------------------------- |
| **Repository** | `backend/repositories/reservationRepository.ts`     | ❌ Not Implemented | Reservation CRUD           |
| **Service**    | `backend/services/reservationService.ts`            | ❌ Not Implemented | Reservation logic          |
| **Routes**     | `backend/routes/reservations/api_reservations_*.ts` | ❌ Not Implemented | Create/delete reservations |

### **Sprint 7: Ledger & Audit**

| Component   | File                                      | Status             | Implementation Notes |
| ----------- | ----------------------------------------- | ------------------ | -------------------- |
| **Service** | `backend/services/ledgerService.ts`       | ❌ Not Implemented | Balance calculations |
| **Service** | `backend/services/auditService.ts`        | ❌ Not Implemented | Audit trail queries  |
| **Routes**  | `backend/routes/ledger/api_ledger_get.ts` | ❌ Not Implemented | Balance reporting    |
| **Routes**  | `backend/routes/audit/api_audit_get.ts`   | ❌ Not Implemented | Audit log access     |

### **Sprint 8: Authentication Completion**

| Component      | File                                        | Status             | Implementation Notes                      |
| -------------- | ------------------------------------------- | ------------------ | ----------------------------------------- |
| **Service**    | `backend/services/authService.ts`           | ⚠️ Partial         | Complete session validation, invite flows |
| **Repository** | `backend/repositories/sessionRepository.ts` | ❌ Not Implemented | Session management                        |
| **Routes**     | `backend/routes/auth/api_auth_*.ts`         | ⚠️ Partial         | Complete all auth endpoints               |

### **Sprint 9: Event Streaming**

| Component   | File                                         | Status             | Implementation Notes |
| ----------- | -------------------------------------------- | ------------------ | -------------------- |
| **Routes**  | `backend/routes/events/api_events_stream.ts` | ❌ Not Implemented | SSE implementation   |
| **Service** | `backend/services/eventService.ts`           | ❌ Not Implemented | Event publishing     |

## 🎯 **Success Criteria**

- **All Routes:** Return proper JSON responses (no 501 errors)
- **All Services:** Implement business logic (no "Not implemented" errors)
- **All Repositories:** Handle DB operations correctly
- **Test Coverage:** 100% pass rate maintained
- **API Compliance:** All endpoints match `api-contracts.md`
- **Data Integrity:** All relationships per `data-model.md`

## 🚀 **Next Steps**

**Ready to start Sprint 1?** The Merchants & Tags foundation will establish our
TDD workflow and provide the building blocks for transactions.

**Plan Approval:** Does this comprehensive plan align with your vision? Any
adjustments needed before we begin implementation?

---

**Last Updated:** October 21, 2025 **Current Sprint:** Sprint 4: Pot Management
(Ready to Start) **Completed Sprints:** 3/9
