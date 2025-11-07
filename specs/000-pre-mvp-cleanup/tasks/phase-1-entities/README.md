# Phase 1: Entity Tasks

**Status**: 🔄 In Progress (5/11 Complete)  
**Estimated Time**: 5-7 days  
**Depends On**: Phase 0 Complete ✅

## Overview

Create CardAccount, CardAccountSettings, and Card entities, update Transaction entity, add to database, repositories, services, and routes.

## Tasks

- [x] **1.1** Create CardAccount Entity (2-3 hrs) ✅ - Core entity with name, issuer, last4, billing cycle, credit limit
- [x] **1.2** Create CardAccountSettings Entity (3-4 hrs) ✅ - Configuration layer with Australian credit card defaults
- [x] **1.3** Create Card Entity (2-3 hrs) ✅ - Optional entity for card attribution to members
- [x] **1.4** Update Transaction Entity (1-2 hrs) ✅ - Add cardAccountId (required) and cardId (optional)
- [x] **1.5** Create Database Tables (3-4 hrs) ✅ - Migration for card_accounts, card_account_settings, and cards
- [ ] **1.6** Create Repositories (4-5 hrs) - CRUD for CardAccount, CardAccountSettings, and Card
- [ ] **1.7** Create Services (4-5 hrs) - Business logic, validation, and settings management
- [ ] **1.8** Create Routes (5-6 hrs) - API endpoints for CardAccount, CardAccountSettings, and Card
- [ ] **1.9** Update Transaction Backend (2-3 hrs) - Add cardAccountId validation to transaction services/routes
- [ ] **1.10** Integration Tests (3-4 hrs) - Entity, repo, service, route tests
- [ ] **1.11** DI Wiring & Exports (1-2 hrs) - Add to DI container and update exports

**Total**: 11 tasks, ~35-45 hours  
**Completed**: 5 tasks, ~12 hours  
**Remaining**: 6 tasks, ~23-33 hours

## Success Criteria

- [x] CardAccount entity created and tested (32 tests)
- [x] CardAccountSettings entity created and tested (36 tests)
- [x] Card entity created and tested (25 tests)
- [x] Transaction entity includes cardAccountId (required) and cardId (optional) (13 tests)
- [x] Database tables created and migrated with proper relationships
- [x] One-to-one relationship between CardAccount and CardAccountSettings enforced
- [x] Default Australian settings (CommBank pattern) available
- [x] All entity tests pass (106/106)
- [ ] Repositories created and tested
- [ ] Services created and tested (including settings management)
- [ ] Routes created and tested
- [ ] All entities exported
- [ ] All new tests pass
- [ ] Can create CardAccount via API (auto-creates settings with defaults)
- [ ] Can create Card via API
- [ ] Can create Transaction with cardAccountId
- [ ] Can update CardAccountSettings via API

## Checkpoint

Before moving to Phase 2, verify:

```bash
# All entity tests pass
deno test shared/__tests__/entities/cardAccount.test.ts
deno test shared/__tests__/entities/cardAccountSettings.test.ts
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

# Database migration successful
deno task db:migrate
psql -d portfolio_card_splitter -c "\d card_accounts"
psql -d portfolio_card_splitter -c "\d card_account_settings"
psql -d portfolio_card_splitter -c "\d cards"

# Can create CardAccount with settings
curl -X POST http://localhost:3000/api/card-accounts \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Chase Sapphire",
    "issuer": "Chase",
    "last4": "1234",
    "billingCycle": 15,
    "creditLimitCents": 500000
  }'

# Verify settings created with defaults
curl http://localhost:3000/api/card-accounts/<id>/settings
```

## Key Features

### CardAccount Entity

- Core financial entity representing credit card accounts
- Fields: name, issuer, last4, billingCycle, creditLimitCents, ownerId
- Soft delete support (isActive)
- Business rules: canDelete (checks for transactions)

### CardAccountSettings Entity

- One-to-one configuration layer for CardAccounts
- Australian credit card defaults (CommBank pattern)
- Fields: statement cycles, interest-free periods, payment rules, reminder settings
- Business logic: date calculations, interest-free validation, minimum payment calculation
- Presets available: CommBank, ANZ, Westpac, NAB

### Card Entity

- Optional attribution entity for "who swiped" tracking
- Fields: cardAccountId, memberId, nickname, last4
- Many cards per CardAccount supported
- Helper: displayName getter for UI rendering

### Transaction Updates

- Added cardAccountId (required) - every transaction must belong to a CardAccount
- Added cardId (optional) - for attribution and filtering
- Breaking change: all Transaction construction requires cardAccountId

## Architecture Notes

- **Entity layer**: Clean Architecture with validation and business logic
- **Settings pattern**: Separate configuration entity with sensible defaults
- **One-to-one relationship**: CardAccount ↔ CardAccountSettings enforced at database level
- **Application-managed**: Settings created by service layer when CardAccount is created
- **Soft delete**: All entities use isActive flag for archival
- **Constructor pattern**: All entities use constructor (not static create())
- **Dual schemas**: Both createSchema and schema for API compatibility

## Migration Strategy

1. **Entity creation**: Tasks 1.1-1.4 (entities only, no database)
2. **Database migration**: Task 1.5 (creates tables with legacy account)
3. **Schema files**: Task 1.6 (Drizzle ORM definitions)
4. **Repositories**: Task 1.7 (data access layer)
5. **Services**: Task 1.8 (business logic, settings management)
6. **Routes**: Tasks 1.9-1.10 (API endpoints)
7. **Testing**: Task 1.11 (comprehensive test coverage)
8. **Exports**: Task 1.12 (final integration)

## Next Phase

Phase 2: Allocation and Payment System

- Update allocations to support CardAccounts
- Update payments to track CardAccount outstanding balances
- Dashboard widgets for CardAccount summaries
  deno test backend/**tests**/repositories/cardAccountRepository.test.ts
  deno test backend/**tests**/repositories/cardRepository.test.ts

# All service tests pass

deno test backend/**tests**/services/cardAccountService.test.ts
deno test backend/**tests**/services/cardService.test.ts

# All route tests pass

deno test backend/**tests**/routes/cardAccounts/
deno test backend/**tests**/routes/cards/

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
```
