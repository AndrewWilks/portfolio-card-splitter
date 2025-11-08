# Phase 0: Cleanup Tasks

**Status**: ⬜ Not Started  
**Estimated Time**: 2-3 days

## Overview

Fix existing database schema and entities to match current specifications before adding new features.

## Tasks

- [x] **0.1** Fix Transfer Schema (2-3 hrs) - Make pot IDs nullable for cash transactions
- [x] **0.2** Fix Payment Schema (2-3 hrs) - Add paidOn, make potId required
- [x] **0.3** Fix Allocation Schema (1-2 hrs) - Remove persisted calculated field
- [x] **0.4** Fix Reservation Schema (2-3 hrs) - Add allocation and member links
- [x] **0.5** Update Entities (3-4 hrs) - Match interfaces to database schemas
- [x] **0.6** Update Repositories (2-3 hrs) - Update queries for new fields
- [x] **0.7** Update Services & Routes (3-4 hrs) - Enforce business rules

**Total**: 7 tasks, ~16-22 hours

## Success Criteria

- [x] All database migrations run successfully
- [x] All entity schemas match database
- [x] All repositories handle updated schemas
- [x] All services enforce updated business rules
- [x] All routes validate updated request/response
- [x] All existing tests pass

## Checkpoint

Before moving to Phase 1, verify:

```bash
# All tests pass
deno test

# All migrations applied
deno task db:migrate

# Database schema matches specs
psql -d portfolio_card_splitter -c "\d transfers"
psql -d portfolio_card_splitter -c "\d payments"
psql -d portfolio_card_splitter -c "\d allocations"
psql -d portfolio_card_splitter -c "\d reservations"
```

## Critical Path

Tasks 0.1-0.4 can run in parallel (database migrations).  
Task 0.5 depends on 0.1-0.4 (entity updates need schema done).  
Task 0.6 depends on 0.5 (repo updates need entity updates).  
Task 0.7 depends on 0.6 (service/route updates need repo updates).

## Next Phase

Phase 1: Create CardAccount and Card entities
