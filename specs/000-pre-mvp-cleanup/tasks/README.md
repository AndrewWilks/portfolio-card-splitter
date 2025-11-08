# Pre-MVP Cleanup: Task Tracker

**Date**: 2025-11-07  
**Status**: ✅ **COMPLETE** (Updated: 2025-11-08)

## Overview

This directory contains individual task files for the Pre-MVP Cleanup implementation. Each phase is broken down into discrete, trackable tasks with clear acceptance criteria.

## Phase Status

- [x] **Phase 0: Cleanup** (7 tasks) ✅ **COMPLETE**
- [x] **Phase 1: Entities** (11 tasks) ✅ **COMPLETE**
- [x] **Phase 2: Validation** (5 tasks) ✅ **COMPLETE**
- [x] **Phase 3: Polish** (4 tasks) ✅ **COMPLETE**

**Total**: 27 tasks - **ALL COMPLETE** ✅

## Completion Summary

### Phase 0: Cleanup ✅ COMPLETE

- All database schema updates applied
- All entity schemas updated
- All repositories updated
- All services and routes updated
- 0 TypeScript compilation errors

### Phase 1: Entities ✅ COMPLETE

- CardAccount entity created
- Card entity created
- Transaction entity updated with cardAccountId and cardId
- All database tables created with migrations
- All repositories implemented
- All services implemented
- All routes implemented and wired through DI
- 176+ tests passing

### Phase 2: Validation ✅ COMPLETE

- Payment validation with reconciliation flagging
- Reservation validation with allocation linking
- Transaction validation with member checks
- Allocation XOR validation tested
- Pot ACL enforcement (SOLO/SHARED visibility)

### Phase 3: Polish ✅ COMPLETE

- Service refinements complete
- Entity relationships validated
- Architecture documentation updated
- Gap analysis completed (spec.md)

## Directory Structure

```
tasks/
├── README.md (this file)
├── phase-0-cleanup/
│   ├── 0.1-fix-transfer-schema.md
│   ├── 0.2-fix-payment-schema.md
│   ├── 0.3-fix-allocation-schema.md
│   ├── 0.4-fix-reservation-schema.md
│   ├── 0.5-update-entities.md
│   ├── 0.6-update-repositories.md
│   └── 0.7-update-services-routes.md
├── phase-1-entities/
│   ├── 1.1-create-cardaccount-entity.md
│   ├── 1.2-create-card-entity.md
│   ├── 1.3-update-transaction-entity.md
│   ├── 1.4-create-database-tables.md
│   ├── 1.5-create-schema-files.md
│   ├── 1.6-create-repositories.md
│   ├── 1.7-create-services.md
│   ├── 1.8-create-routes.md
│   ├── 1.9-update-transaction-routes.md
│   ├── 1.10-add-tests.md
│   └── 1.11-update-exports.md
├── phase-2-validation/
│   ├── 2.1-payment-validation.md
│   ├── 2.2-reservation-validation.md
│   ├── 2.3-transaction-validation.md
│   ├── 2.4-allocation-validation.md
│   └── 2.5-pot-validation.md
└── phase-3-polish/
    ├── 3.1-service-refinements.md
    ├── 3.2-entity-documentation.md
    ├── 3.3-architecture-docs.md
    └── 3.4-gap-analysis-update.md
```

## How to Use

1. **Start with Phase 0** - Complete all cleanup tasks before moving forward
2. **Check off tasks** - Mark tasks complete in phase README and individual task files
3. **Verify acceptance criteria** - Ensure all criteria met before marking complete
4. **Update this file** - Keep phase status current

## Quick Start

```bash
# View current phase
cd specs/000-pre-mvp-cleanup/tasks/phase-0-cleanup

# Start first task
open 0.1-fix-transfer-schema.md

# Run tests after each task
deno test

# Mark task complete when all acceptance criteria pass
```

## Dependencies

- Phase 1 depends on Phase 0 completion (database schema must be clean)
- Phase 2 depends on Phase 1 completion (entities must exist)
- Phase 3 can start after Phase 2 (polish and documentation)

## Timeline

- **Phase 0**: 2-3 days
- **Phase 1**: 4-5 days
- **Phase 2**: 2-3 days
- **Phase 3**: 1-2 days

**Total**: 9-13 days
