# Task Breakdown: Visual Guide

## 📊 Project Overview

```
Pre-MVP Cleanup
├── 27 Tasks
├── 4 Phases
├── 9-13 Days
└── Clear Acceptance Criteria
```

## 🎯 Phase Overview

### Phase 0: Cleanup 🧹 (2-3 days)

**Goal**: Fix existing code that conflicts with specs

```
0.1 ─┬─ Fix Transfer Schema        [2-3 hrs] ⬜
     │
0.2 ─┼─ Fix Payment Schema         [2-3 hrs] ⬜
     │
0.3 ─┼─ Fix Allocation Schema      [1-2 hrs] ⬜
     │
0.4 ─┼─ Fix Reservation Schema     [2-3 hrs] ⬜
     │
0.5 ─┼─ Update Entities            [3-4 hrs] ⬜ (depends on 0.1-0.4)
     │
0.6 ─┼─ Update Repositories        [2-3 hrs] ⬜ (depends on 0.5)
     │
0.7 ─┴─ Update Services & Routes   [3-4 hrs] ⬜ (depends on 0.6)

Total: 7 tasks, 16-22 hours
```

### Phase 1: Entities 🚨 (4-5 days)

**Goal**: Create CardAccount and Card entities (MVP blocker)

```
1.1 ─┬─ Create CardAccount Entity  [2-3 hrs] ⬜
     │
1.2 ─┼─ Create Card Entity         [2-3 hrs] ⬜
     │
1.3 ─┼─ Update Transaction Entity  [1-2 hrs] ⬜
     │
1.4 ─┼─ Create Database Tables     [2-3 hrs] ⬜ (depends on 1.1-1.3)
     │
1.5 ─┼─ Create Schema Files        [2-3 hrs] ⬜ (depends on 1.4)
     │
1.6 ─┼─ Create Repositories        [3-4 hrs] ⬜ (depends on 1.5)
     │
1.7 ─┼─ Create Services            [3-4 hrs] ⬜ (depends on 1.6)
     │
1.8 ─┼─ Create Routes              [4-5 hrs] ⬜ (depends on 1.7)
     │
1.9 ─┼─ Update Transaction Routes  [2-3 hrs] ⬜ (depends on 1.8)
     │
1.10─┼─ Add Tests                  [4-6 hrs] ⬜ (throughout)
     │
1.11─┴─ Update Exports             [1 hr]    ⬜ (depends on all)

Total: 11 tasks, 26-37 hours
```

### Phase 2: Validation ✅ (2-3 days)

**Goal**: Enforce business rules

```
2.1 ─┬─ Payment Validation         [3-4 hrs] ⬜
     │
2.2 ─┼─ Reservation Validation     [3-4 hrs] ⬜
     │
2.3 ─┼─ Transaction Validation     [3-4 hrs] ⬜
     │
2.4 ─┼─ Allocation Validation      [2-3 hrs] ⬜
     │
2.5 ─┴─ Pot Validation             [2-3 hrs] ⬜

Total: 5 tasks, 13-18 hours
(Tasks can run in parallel)
```

### Phase 3: Polish 📝 (1-2 days)

**Goal**: Documentation and final touches

```
3.1 ─┬─ Service Refinements        [2-3 hrs] ⬜
     │
3.2 ─┼─ Entity Documentation       [2-3 hrs] ⬜
     │
3.3 ─┼─ Architecture Docs          [2-3 hrs] ⬜
     │
3.4 ─┴─ Gap Analysis Update        [1-2 hrs] ⬜

Total: 4 tasks, 7-11 hours
```

## 📋 How to Use This System

### 1. Start with a Task File

```bash
cd specs/000-pre-mvp-cleanup/tasks/phase-0-cleanup
open 0.1-fix-transfer-schema.md
```

### 2. Work Through the Checklist

```markdown
## Todo

- [ ] Create migration file
- [ ] Make fields nullable
- [ ] Add check constraint
- [ ] Run migration
- [ ] Test transfers
```

### 3. Verify Acceptance Criteria

```markdown
## Acceptance Criteria

- [ ] Migration runs without errors
- [ ] Both pot IDs are nullable
- [ ] Check constraint prevents both null
- [ ] All transfer tests pass
```

### 4. Mark Complete

```bash
# Update task file status
**Status**: ✅ Complete

# Update phase README
- [x] **0.1** Fix Transfer Schema ✅

# Update master tracker
Phase 0: 1/7 complete
```

## 🔄 Workflow

```
Choose Task
    ↓
Read Task File
    ↓
Work Checklist
    ↓
Run Verification
    ↓
Check Acceptance Criteria
    ↓
All Pass? ─No→ Fix Issues ──┐
    ↓ Yes                    │
Mark Complete               │
    ↓                       │
Update README               │
    ↓                       │
Next Task ←─────────────────┘
```

## 📍 Current Status

**Overall Progress**: 0/27 tasks complete (0%)

**Phase Status**:

- [ ] Phase 0: 0/7 (0%)
- [ ] Phase 1: 0/11 (0%)
- [ ] Phase 2: 0/5 (0%)
- [ ] Phase 3: 0/4 (0%)

## 🎯 Quick Start

```bash
# View task list
cat specs/000-pre-mvp-cleanup/tasks/README.md

# Start Phase 0
cd specs/000-pre-mvp-cleanup/tasks/phase-0-cleanup
cat README.md

# Open first task
code 0.1-fix-transfer-schema.md

# Run tests after completing task
deno test

# Check phase progress
cat README.md
```

## ✅ Success Indicators

### Phase 0 Done When

```bash
✓ All migrations run successfully
✓ All entities match database schemas
✓ All repositories handle new fields
✓ All services enforce business rules
✓ All tests pass
```

### Phase 1 Done When

```bash
✓ CardAccount entity created
✓ Card entity created
✓ Database tables created
✓ Can create transactions with cardAccountId
✓ All tests pass
```

### Phase 2 Done When

```bash
✓ All validation enforced
✓ Service layer throws clear errors
✓ API returns proper error codes
✓ All tests pass
```

### Phase 3 Done When

```bash
✓ Documentation updated
✓ Gap analysis complete
✓ Test coverage meets goals
✓ Manual testing complete
```

## 🎉 Project Complete

When all 27 tasks marked complete:

```
✅ Phase 0: 7/7 complete
✅ Phase 1: 11/11 complete
✅ Phase 2: 5/5 complete
✅ Phase 3: 4/4 complete

Total: 27/27 tasks complete (100%)
Status: READY TO MERGE 🚀
```

---

**Remember**: Each task is designed to be completable in one sitting (1-6 hours). Break if needed, pick up where you left off using the checklist!
