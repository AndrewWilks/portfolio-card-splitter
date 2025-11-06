# Phase 1: Entity Tasks

**Status**: ⬜ Not Started  
**Estimated Time**: 4-5 days  
**Depends On**: Phase 0 Complete

## Overview

Create CardAccount and Card entities, add to database, repositories, services, and routes.

## Tasks

- [ ] **1.1** Create CardAccount Entity (2-3 hrs) - Shared entity with validation
- [ ] **1.2** Create Card Entity (2-3 hrs) - Shared entity with validation
- [ ] **1.3** Update Transaction Entity (1-2 hrs) - Add cardAccountId and cardId fields
- [ ] **1.4** Create Database Tables (2-3 hrs) - Migration for card_accounts and cards
- [ ] **1.5** Create Schema Files (2-3 hrs) - Drizzle schema and relations
- [ ] **1.6** Create Repositories (3-4 hrs) - CRUD for CardAccount and Card
- [ ] **1.7** Create Services (3-4 hrs) - Business logic and validation
- [ ] **1.8** Create Routes (4-5 hrs) - API endpoints for CardAccount and Card
- [ ] **1.9** Update Transaction Routes (2-3 hrs) - Add cardAccountId to transaction APIs
- [ ] **1.10** Add Tests (4-6 hrs) - Entity, repo, service, route tests
- [ ] **1.11** Update Exports (1 hr) - Add to shared/entities/index.ts

**Total**: 11 tasks, ~26-37 hours

## Success Criteria

- [ ] CardAccount entity created and tested
- [ ] Card entity created and tested
- [ ] Transaction entity includes cardAccountId (required) and cardId (optional)
- [ ] Database tables created and migrated
- [ ] Repositories created and tested
- [ ] Services created and tested
- [ ] Routes created and tested
- [ ] All entities exported
- [ ] All new tests pass
- [ ] Can create CardAccount via API
- [ ] Can create Card via API
- [ ] Can create Transaction with cardAccountId

## Checkpoint

Before moving to Phase 2, verify:

```bash
# All entity tests pass
deno test shared/__tests__/entities/cardAccount.test.ts
deno test shared/__tests__/entities/card.test.ts
deno test shared/__tests__/entities/transaction.test.ts

# All repository tests pass
deno test backend/__tests__/repositories/cardAccountRepository.test.ts
deno test backend/__tests__/repositories/cardRepository.test.ts

# All service tests pass
deno test backend/__tests__/services/cardAccountService.test.ts
deno test backend/__tests__/services/cardService.test.ts

# All route tests pass
deno test backend/__tests__/routes/cardAccounts/
deno test backend/__tests__/routes/cards/

# Integration test
curl http://localhost:3000/api/card-accounts
curl http://localhost:3000/api/cards
```

## Critical Path

1.1 → 1.2 → 1.3 (Entities first)  
1.4 (Database migration after entities)  
1.5 (Schema files after migration)  
1.6 (Repos after schema files)  
1.7 (Services after repos)  
1.8 (Routes after services)  
1.9 (Transaction routes after 1.3 and 1.8)  
1.10 (Tests throughout)  
1.11 (Exports at end)

## Next Phase

Phase 2: Add validation and business rules
